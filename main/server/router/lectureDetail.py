# from fastapi import FastAPI, HTTPException, APIRouter
# from db import db_connect

# router = APIRouter()

# @router.get("/lecture/{year}/{semester}/{lecture_number}")
# async def get_lecture(year: int, semester: str, lecture_number: str):
#     query = """
#     SELECT lecName FROM LectureList WHERE lecNumber = ? AND year = ? AND semester = ?
#     """

#     conn = db_connect()
#     cursor = conn.cursor()
#     cursor.execute(query, (lecture_number, year, semester))
#     row = cursor.fetchone()
#     conn.close()

#     if row is None:
#         raise HTTPException(status_code=404, detail="Lecture not found")

#     return {"lecName": row[0]}  # S


from fastapi import FastAPI, HTTPException, APIRouter
from db import db_connect
from pydantic import BaseModel
from typing import Optional


router = APIRouter()


class LectureDetail(BaseModel):
    lectureID: int
    year: Optional[int]
    semester: Optional[str]
    lecNumber: str
    lecName: Optional[str]
    lecProfessor: Optional[str]
    lecClassification: Optional[str]
    lecTheme: Optional[str]
    lecCredit: Optional[int]
    lecTime: Optional[str]
    lecWeekTime: Optional[int]
    lecClassroom: Optional[str]
    isLecClose: Optional[bool]
    takenPeople1yearsAgo: Optional[int]
    takenPeople2yearsAgo: Optional[int]
    takenPeople3yearsAgo: Optional[int]
    ForeignLanguage: Optional[str]
    percentageOfOnline: Optional[int]
    isPNP: Optional[bool]
    isEngineering: Optional[bool]
    isTBL: Optional[bool]
    isPBL: Optional[bool]
    isSeminar: Optional[bool]
    isSmall: Optional[bool]
    isConvergence: Optional[bool]
    isTeamTeaching: Optional[bool]
    isFocus: Optional[bool]
    isExperimentDesign: Optional[bool]
    isELearning: Optional[bool]
    isArt: Optional[bool]
    representCompetency: Optional[str]
    learningGoalNmethod: Optional[str]
    Overview: Optional[str]
    evaluationRatio: Optional[str]
    mainBook: Optional[str]
    scheduleNcontent: Optional[str]
    everytimeUrl: Optional[str]
    star: Optional[float]
    assignmentAmount: Optional[float]
    teamPlayAmount: Optional[float]
    gradeAmount: Optional[float]
    reviewSummary: Optional[str]
    checkAttend: Optional[str]
    testNum: Optional[str]


@router.get("/lecture/{year}/{semester}/{lecture_number}", response_model=LectureDetail)
async def get_lecture(year: int, semester: str, lecture_number: str):
    query = """
    SELECT * FROM LectureDetailView 
    WHERE lecNumber = ? AND year = ? AND semester = ?
    """

    conn = db_connect()
    cursor = conn.cursor()
    cursor.execute(query, (lecture_number, year, semester))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Lecture not found")

    # Convert the row tuple to a dictionary
    columns = [column[0] for column in cursor.description]
    lecture_dict = dict(zip(columns, row))

    return LectureDetail(**lecture_dict)
