from typing import List, Dict
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uvicorn
import os
import sqlite3
from fastapi import FastAPI, Depends, HTTPException, Cookie
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.responses import RedirectResponse
import httpx
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from typing import Union

load_dotenv()

# 노션 - 기타 - api key 참고
client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

user_sessions = {}

# 실제 build나 deploy 전에는 db 환경 제대로 세팅하는 게 필요
DATABASE = './kwu-lecture-database-v6.db'


def db_connect():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


app = FastAPI()

# cors 관련 설정
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LectureRequest(BaseModel):
    userGrade: int  # 유저 학년
    userBunban: str  # 유저 분반
    lecClassification: str  # 전필/전전/교선/교필 ...
    userTakenCourse: Optional[List[str]] = None  # 유저 수강 내역
    isUserForeign: Optional[int] = None  # 유저 외국인 여부  # lecForeignPeopleCanTake
    isUserMultiple: Optional[int] = None  # 유저 복전 여부 # lecCanTakeMultipleMajor
    lecStars: Optional[float] = None  # 별점
    lecAssignment: Optional[int] = None  # 과제
    lecTeamplay: Optional[int] = None  # 팀플
    lecGrade: Optional[int] = None  # 성적
    lecIsPNP: Optional[int] = None  # pnp 여부
    lecCredit: Optional[int] = None  # 학점
    lecIsTBL: Optional[int] = None  # TBL 여부
    lecIsPBL: Optional[int] = None  # PBL 여부
    lecIsSeminar: Optional[int] = None  # 세미나 강의 여부
    lecIsSmall: Optional[int] = None  # 소규모 강의 여부
    lecIsConvergence: Optional[int] = None  # 융합 강의 여부
    lecIsNoneFace: Optional[int] = None  # 100% 비대면 여부
    lecIsArt: Optional[int] = None  # 실습 강의 여부
    lecSubName: Optional[str] = None  # 테마


@app.post("/lectures", response_model=List[dict])
async def read_lectures(request: LectureRequest):
    conn = db_connect()
    cursor = conn.cursor()

    classification = request.lecClassification
    user_grade = request.userGrade

    # 공통 쿼리 템플릿
    query_template = """
    SELECT lecClassName, lecNumber, lecProfessor, lecCredit, lecTime, lecSubName, lecAssignment, lecTeamplay, lecGrade, lecSummaryReview, lecStars, lecClassification, lecIsPNP, lecIsEngeneering, lecTakeOnly1Year, lecTakeOnly2Year, lecTakeOnly3Year, lecTakeOnly4Year, lecTakeOnly5Year, lecIsArt, lecIsDoExperiment, lecIsOnline, lecIsRecorded
    FROM LectureTable
    WHERE {bunban_condition}
    AND lecClassification = ?
    AND (
        lecTakeOnly{user_grade}Year = 1 OR 
        (lecTakeOnly1Year is NULL AND lecTakeOnly2Year is NULL AND lecTakeOnly3Year is NULL AND lecTakeOnly4Year is NULL)
    )
    """

    if classification in ["전필", "전선"]:
        bunban_condition = "lecMajorRecogBunban LIKE ?"
    else:
        bunban_condition = "lecCanTakeBunban LIKE ?"

    query = query_template.format(
        bunban_condition=bunban_condition, user_grade=user_grade)

    parameters = [f"%{request.userBunban}%", classification]
    # print("request.lecStars: ", request.lecStars)
    # print("subname: ", request.lecSubName)

    # 아래 조건들에 따라서 쿼리문이 추가됨
    if request.userTakenCourse:
        placeholders = ', '.join(['?'] * len(request.userTakenCourse))
        query += f" AND lecClassName NOT IN ({placeholders})"
        parameters.extend(request.userTakenCourse)
    if request.lecSubName:
        query += " AND lecSubName = ?"
        parameters.append(request.lecSubName)
    if request.isUserForeign is not None:
        query += " AND lecForeignPeopleCanTake = 1"
    if request.isUserMultiple is not None:
        query += " AND lecCanTakeMultipleMajor = 1"
    if request.lecStars:
        # print(request.lecStars)
        query += " AND lecStars >= ?"
        parameters.append(str(request.lecStars))
    if request.lecAssignment is not None:
        # print("add queary: AND lecAssignment >= 65")
        query += " AND lecAssignment >= 65"
    if request.lecTeamplay is not None:
        query += " AND lecTeamplay >= 65"
    if request.lecGrade is not None:
        query += " AND lecGrade >= 65"
    if request.lecIsPNP is not None:
        query += " AND lecIsPNP = 1"
    if request.lecCredit is not None:
        query += " AND lecCredit = ?"
        parameters.append(str(request.lecCredit))
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

    print("=======\n")

    cursor.execute(query, parameters)
    lectures = cursor.fetchall()

    conn.close()

    print(lectures)

    if not lectures:
        raise HTTPException(status_code=404, detail="해당 조건에 맞는 강의가 없어요..😢")

    # 우선 class name, lecture number만 반환되도록 함.
    # 실제 페이지별로 필요한? 반환값들 확실히 해서 정리하는 것이 필요

    return_data = []
    for lecture in lectures:
        lecClassName = lecture["lecClassName"] if lecture["lecClassName"] else "값이 비었어요"
        lecNumber = lecture["lecNumber"] if lecture["lecNumber"] else "값이 비었어요"
        lecProfessor = lecture["lecProfessor"] if lecture["lecProfessor"] else "값이 비었어요"
        lecCredit = lecture["lecCredit"] if lecture["lecCredit"] else "값이 비었어요"
        lecTime = lecture["lecTime"] if lecture["lecTime"] else "값이 비었어요"
        lecSubName = lecture["lecSubName"] if lecture["lecSubName"] else "값이 비었어요"
        lecAssignment = lecture["lecAssignment"] if lecture["lecAssignment"] else "값이 비었어요"
        lecTeamplay = lecture["lecTeamplay"] if lecture["lecTeamplay"] else "값이 비었어요"
        lecGrade = lecture["lecGrade"] if lecture["lecGrade"] else "값이 비었어요"
        lecSummaryReview = lecture["lecSummaryReview"] if lecture["lecSummaryReview"] else "값이 비었어요"
        lecStars = lecture["lecStars"] if lecture["lecStars"] else "값이 비었어요"
        lecClassification = lecture["lecClassification"] if lecture["lecClassification"] else "값이 비었어요"

        return_data.append({
            "lecClassName": lecClassName,
            "lecNumber": lecNumber,
            "lecProfessor": lecProfessor,
            "lecCredit": lecCredit,
            "lecTime": lecTime,
            "lecSubName": lecSubName,
            "lecAssignment": lecAssignment,
            "lecTeamplay": lecTeamplay,
            "lecGrade": lecGrade,
            "lecSummaryReview": lecSummaryReview,
            "lecStars": lecStars,
            "lecClassification": lecClassification
        })

    return return_data


class LoggedInResponse(BaseModel):
    message: str
    user_id: str


class NotLoggedInResponse(BaseModel):
    message: str


@app.get("/", response_model=Union[LoggedInResponse, NotLoggedInResponse])
async def root(user_id: str = Cookie(None)):  # 쿠키에서 user_id 가져옴, 없으면 None
    if user_id and user_id in user_sessions:
        return {
            "message": f"Hello, {user_sessions[user_id]['name']}!",
            "user_id": user_id
        }
    return {"message": "log in required"}


@app.get("/login")
async def login():
    redirect_uri = "http://localhost:8000/auth/callback"
    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/auth?client_id={client_id}&redirect_uri={redirect_uri}&scope=openid%20profile%20email&response_type=code"
    )


@app.get("/auth/callback")
async def auth_callback(code: str):
    redirect_uri = "http://localhost:8000/auth/callback"
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_json = token_response.json()
        if "access_token" not in token_json:
            raise HTTPException(
                status_code=400, detail="Invalid token response")

        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_json['access_token']}"}
        )
        user_info = user_info_response.json()
        """
        return 값들:
            id: int
            email: str
            verified_email: boolen
            name: str
            given_name: str
            family_name: str
            picture: str // 링크 형식, 구글 프로필 이미지같음

        여기서 실제로 의미있는 값은 id와 name정도
        """

        user_id = user_info['sub']  # google 사용자 고유 ID는 sub 필드에 저장됨
        user_name = user_info['name']

        user_sessions[user_id] = user_info

        conn = db_connect()
        conn.execute(
            'INSERT OR IGNORE INTO user (user_id, userName) VALUES (?, ?)',
            (user_id, user_name)
        )
        conn.commit()
        conn.close()

        response = RedirectResponse(url="http://localhost:3000/")
        max_age = 300000  # 30000 초
        response.set_cookie(key="user_id", value=user_id, max_age=max_age)

        return response  # 쿠키 return


class PersonalInformation(BaseModel):
    user_id: str  # 유저 아이디
    userHakbun: int  # 학번
    userIsForeign: bool  # 외국인 여부
    userBunban: str  # 분반
    userYear: str  # 학년
    userMajor: str  # 전공
    userIsMultipleMajor: bool  # 복수전공 여부
    userWhatMultipleMajor: Optional[str] = None  # 복수전공 전공학과
    userTakenLecture: Optional[str] = None  # 수강 강의
    userName: str
    selectedLecNumbers: List[str]
    userTakenLectures: List[dict]  # 유저가 수강한 강의(db에서가져온)
    userCredit: Optional[str] = None  # 유저가 받은 학점


class userSelectedLecture(BaseModel):
    lecNumber: str


@app.get("/user/data", response_model=List[PersonalInformation])
async def get_user_data(request: Request):
    user_id = request.cookies.get("user_id")
    print(f"|-- /user/data | user_id: {user_id}")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM user WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()

    if not rows:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    users = []
    for row in rows:
        user_dict = dict(row)

        cursor.execute(
            "SELECT lecNumber FROM userListedLecture WHERE user_id = ?", (user_dict['user_id'],))
        lecNumbers = cursor.fetchall()
        user_dict['selectedLecNumbers'] = [lecNumber[0]
                                           for lecNumber in lecNumbers]

        cursor.execute(
            # userCredit을 함께 가져오기 위한 쿼리 수정
            "SELECT takenLecName, takenLecClassification, takenLecCredit, userCredit FROM userTakenLecture WHERE user_id = ?",
            (user_dict['user_id'],)
        )
        takenLectures = cursor.fetchall()
        user_dict['userTakenLectures'] = [
            # userCredit을 포함하도록 수정
            {
                "lectureName": lecture[0],
                "lecClassification": lecture[1],
                "lecCredit": lecture[2],
                "userCredit": lecture[3]  # userCredit 추가
            }
            for lecture in takenLectures
        ]

        user_dict['userCredit'] = user_dict.get('userCredit')

        print("|-- /user/data | user_dict:",
              user_dict['selectedLecNumbers'], user_dict['userTakenLectures'])

        user_info = PersonalInformation(
            user_id=user_dict['user_id'],
            userHakbun=user_dict['userHakbun'],
            userIsForeign=user_dict['userIsForeign'],
            userBunban=user_dict['userBunban'],
            userYear=user_dict['userYear'],
            userMajor=user_dict['userMajor'],
            userIsMultipleMajor=user_dict['userIsMultipleMajor'],
            userWhatMultipleMajor=user_dict['userWhatMultipleMajor'],
            userTakenLecture=user_dict['userTakenLecture'],
            userName=user_dict['userName'],
            selectedLecNumbers=user_dict['selectedLecNumbers'],
            userTakenLectures=user_dict['userTakenLectures'],
            userCredit=user_dict['userCredit']
        )

        users.append(user_info)
        print("|-- /user/data | users:", users)

    conn.close()

    return users


@app.put("/user/update")
async def update_user_hakbun(request: PersonalInformation):
    conn = db_connect()
    cursor = conn.cursor()

    # user 테이블 업데이트 쿼리
    query = """
    UPDATE user
    SET userHakbun = ?,
        userIsForeign = ?,
        userBunban = ?,
        userYear = ?,
        userMajor = ?,
        userIsMultipleMajor = ?,
        userWhatMultipleMajor = ?,
        userName = ?
    WHERE user_id = ?
    """

    cursor.execute(query, (
        request.userHakbun,
        request.userIsForeign,
        request.userBunban,
        request.userYear,
        request.userMajor,
        request.userIsMultipleMajor,
        request.userWhatMultipleMajor,
        request.userName,
        request.user_id
    ))

    if cursor.rowcount == 0:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=404, detail="user not found")

    cursor.execute(
        "DELETE FROM userTakenLecture WHERE user_id = ?", (request.user_id,))

    if request.userTakenLectures:
        query = """
        INSERT INTO userTakenLecture (user_id, takenLecName, takenLecClassification, takenLecCredit, userCredit)
        VALUES (?, ?, ?, ?, ?)
        """
        for lecture in request.userTakenLectures:
            cursor.execute(query, (
                request.user_id,
                lecture.get('lectureName'),
                lecture.get('lecClassification'),
                lecture.get('lecCredit'),
                lecture.get('userCredit')
            ))

    conn.commit()
    conn.close()

    return {"message": "updated"}


class LecturesUpdateRequest(BaseModel):
    userId: str
    lecNumbers: List[str]


@app.post("/user/update_select_lectures")
async def update_selected_lectures(request: LecturesUpdateRequest):
    user_id = request.userId

    if not user_id:
        raise HTTPException(status_code=403, detail="login required")

    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM user WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="not user")

    cursor.execute('''
    SELECT lecNumber FROM userListedLecture WHERE user_id = ?
    ''', (user_id,))
    current_lectures = cursor.fetchall()
    current_lectures = {lec[0] for lec in current_lectures}

    incoming_lectures = set(request.lecNumbers)

    lectures_to_add = incoming_lectures - current_lectures
    lectures_to_remove = current_lectures - incoming_lectures

    for lecNumber in lectures_to_add:
        try:
            cursor.execute('''
            INSERT INTO userListedLecture (user_id, lecNumber) 
            VALUES (?, ?)
            ''', (user_id, lecNumber))
        except sqlite3.IntegrityError:
            continue

    for lecNumber in lectures_to_remove:
        cursor.execute('''
        DELETE FROM userListedLecture WHERE user_id = ? AND lecNumber = ?
        ''', (user_id, lecNumber))

    conn.commit()
    conn.close()

    return {"message": "updated"}


class OCRRequest(BaseModel):
    text: str


class OCRResponse(BaseModel):
    userTakenLectures: List[Dict[str, str]]


@app.post("/user/update/ocr", response_model=OCRResponse)
async def process_text(request: OCRRequest):
    text = request.text
    words = text.split()

    conn = db_connect()
    cursor = conn.cursor()

    user_taken_lectures = []
    lecture_names_set = set()

    for word in words:
        if len(word) > 3:
            cursor.execute(
                "SELECT lecClassName, lecClassification, lecCredit FROM LectureTable WHERE lecClassName LIKE ?", ('%' + word + '%',))
            rows = cursor.fetchall()
            for row in rows:
                lecture_name = row['lecClassName']
                if lecture_name not in lecture_names_set:
                    lecture_info = {
                        'lectureName': lecture_name,
                        'lecClassification': row['lecClassification'],
                        'lecCredit': str(row['lecCredit'])
                    }
                    user_taken_lectures.append(lecture_info)
                    lecture_names_set.add(lecture_name)

    conn.close()
    # print(user_taken_lectures)
    return OCRResponse(userTakenLectures=user_taken_lectures)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
