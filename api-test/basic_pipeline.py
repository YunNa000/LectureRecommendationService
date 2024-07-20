from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, condecimal
from typing import List, Optional
import sqlite3
import uvicorn

app = FastAPI()

def db_connect():
    conn = sqlite3.connect('./kwu-lecture-database-v3.db')
    conn.row_factory = sqlite3.Row
    return conn

class LectureRequest(BaseModel):
    userGrade: int # 유저 학년 #done
    userBunban: str # 유저 분반 #done
    sub_name: str # 전필/전전/교선/교필 ... #done
    userTakenCourse: Optional[List[str]] = None # 유저 수강 내역
    isUserForeign: Optional[int] = None # 유저 외국인 여부  # lecForeignPeopleCanTake # done
    isUserMultiple: Optional[int] = None # 유저 복전 여부 # lecCanTakeMultipleMajor # done
    lecStars: Optional[float] = None # 별점 # done
    lecAssignment: Optional[int] = None # 과제 #done
    lecTeamplay: Optional[int] = None # 팀플 #done
    lecGrade: Optional[int] = None # 성적 # done
    lecIsPNP: Optional[int] = None # pnp 여부 #done
    lecCredit: Optional[int] = None # 학점 #done
    lecIsTBL: Optional[int] = None # TBL 여부 #done
    lecIsPBL: Optional[int] = None # PBL 여부 #done
    lecIsSeminar: Optional[int] = None # 세미나 강의 여부 #done
    lecIsSmall: Optional[int] = None # 소규모 강의 여부 #done
    lecIsConvergence: Optional[int] = None # 융합 강의 여부 #done
    lecIsNoneFace: Optional[int] = None # 100% 비대면 여부, 만약 이게 1이라면, 쿼리에는 lecIsLearning 혹은 lecIsOnline 혹은 lecIsREcorded가 1인 행을 찾도록 하면 될듯 # done
    lecIsArt: Optional[int] = None # 실습 강의 여부 #done


@app.post("/lectures", response_model=List[dict])
def read_lectures(request: LectureRequest):
    conn = db_connect()
    cursor = conn.cursor()
    
    query = """
    SELECT lecClassName, lecNumber
    FROM LectureTable
    WHERE lecCanTakeBunban LIKE ?
    AND lecSubName = ?
    AND (
        lecTakeOnly{userGrade}Year = 1 OR 
        (lecTakeOnly1Year is NULL AND lecTakeOnly2Year is NULL AND lecTakeOnly3Year is NULL AND lecTakeOnly4Year is NULL)
    )
    """
    
    query = query.format(userGrade=request.userGrade)

    parameters = [f"%{request.userBunban}%", request.sub_name]

    if request.userTakenCourse:
        placeholders = ', '.join(['?'] * len(request.userTakenCourse))
        query += f" AND lecClassName NOT IN ({placeholders})"
        parameters.extend(request.userTakenCourse)

    if request.isUserForeign is not None:
        query += " AND lecForeignPeopleCanTake = 1"

    if request.isUserMultiple is not None:
        query += " AND lecCanTakeMultipleMajor = 1"

    if request.lecStars is not None:
        query += " AND lecStars >= ?"
        parameters.append(request.lecStars)

    if request.lecAssignment is not None:
        query += " AND lecAssignment <= 35"

    if request.lecTeamplay is not None:
        query += " AND lecTeamplay <= 35"

    if request.lecGrade is not None:
        query += " AND lecGrade <= 35"

    if request.lecIsPNP is not None:
        query += " AND lecIsPNP = 1"

    if request.lecCredit is not None:
        query += " AND lecCredit = ?"
        parameters.append(request.lecCredit)

    if request.lecIsTBL is not None:
        query += " AND lecIsTBL = 1"

    if request.lecIsPBL is not None:
        query += " AND lecIsPBL = 1"

    if request.lecIsSeminar is not None:
        query += " AND lecIsSeminar = 1"

    if request.lecIsSmall is not None:
        query += " AND lecIsSmall = 1"

    if request.lecIsConvergence is not None:
        query += " AND lecIsConvergence = 1"

    if request.lecIsNoneFace is not None:
        query += " AND (lecIseLearning = 1 OR lecIsDistance100 = 1)"

    if request.lecIsArt is not None:
        query += " AND lecIsArt = 1"


    cursor.execute(query, parameters)
    lectures = cursor.fetchall()
    
    conn.close()
    
    if not lectures:
        raise HTTPException(status_code=404, detail="해당 조건에 맞는 강의가 없어요..😢")
    
    return [{"lecClassName": lecture["lecClassName"], "lecNumber": lecture["lecNumber"]} for lecture in lectures]

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
