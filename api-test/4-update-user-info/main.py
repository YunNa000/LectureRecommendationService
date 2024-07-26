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

load_dotenv()

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

user_sessions = {}

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="",
    tokenUrl="",
)

DATABASE = './kwu-lecture-database-v4.db'

def db_connect():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class LectureRequest(BaseModel):
    userGrade: int # 유저 학년 
    userBunban: str # 유저 분반 
    lecClassification: str # 전필/전전/교선/교필 ... 
    userTakenCourse: Optional[List[str]] = None # 유저 수강 내역
    isUserForeign: Optional[int] = None # 유저 외국인 여부  # lecForeignPeopleCanTake 
    isUserMultiple: Optional[int] = None # 유저 복전 여부 # lecCanTakeMultipleMajor 
    lecStars: Optional[float] = None # 별점 
    lecAssignment: Optional[int] = None # 과제 
    lecTeamplay: Optional[int] = None # 팀플 
    lecGrade: Optional[int] = None # 성적 
    lecIsPNP: Optional[int] = None # pnp 여부 
    lecCredit: Optional[int] = None # 학점 
    lecIsTBL: Optional[int] = None # TBL 여부 
    lecIsPBL: Optional[int] = None # PBL 여부 
    lecIsSeminar: Optional[int] = None # 세미나 강의 여부 
    lecIsSmall: Optional[int] = None # 소규모 강의 여부 
    lecIsConvergence: Optional[int] = None # 융합 강의 여부 
    lecIsNoneFace: Optional[int] = None # 100% 비대면 여부
    lecIsArt: Optional[int] = None # 실습 강의 여부 
    lecSubName: Optional[List[str]] = None # 테마

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

@app.post("/lectures", response_model=List[dict])
def read_lectures(request: LectureRequest):
    conn = db_connect()
    cursor = conn.cursor()
    
    query = """
    SELECT lecClassName, lecNumber
    FROM LectureTable
    WHERE lecCanTakeBunban LIKE ?
    AND lecClassification = ?
    AND (
        lecTakeOnly{userGrade}Year = 1 OR 
        (lecTakeOnly1Year is NULL AND lecTakeOnly2Year is NULL AND lecTakeOnly3Year is NULL AND lecTakeOnly4Year is NULL)
    )
    """
    
    query = query.format(userGrade=request.userGrade)

    parameters = [f"%{request.userBunban}%", request.lecClassification]

    if request.userTakenCourse:
        placeholders = ', '.join(['?'] * len(request.userTakenCourse))
        query += f" AND lecClassName NOT IN ({placeholders})"
        parameters.extend(request.userTakenCourse)
    if request.lecSubName:
        placeholders = ', '.join(['?'] * len(request.lecSubName))
        query += f" AND lecSubName IN ({placeholders})"
        parameters.extend(request.lecSubName)
    if request.isUserForeign is not None:
        query += " AND lecForeignPeopleCanTake = 1"
    if request.isUserMultiple is not None:
        query += " AND lecCanTakeMultipleMajor = 1"
    if request.lecStars is not None:
        query += " AND lecStars >= ?"
        parameters.append(str(request.lecStars))
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

    cursor.execute(query, parameters)
    lectures = cursor.fetchall()
    
    conn.close()
    
    if not lectures:
        raise HTTPException(status_code=404, detail="해당 조건에 맞는 강의가 없어요..😢")
    
    return [{"lecClassName": lecture["lecClassName"], "lecNumber": lecture["lecNumber"]} for lecture in lectures]

@app.get("/")
async def root(user_id: str = Cookie(None)):
    if user_id and user_id in user_sessions:
        return {
            "message": f"Hello, {user_sessions[user_id]['name']}!",
            "user_id": user_id
        }
    return {"message": "please log in."}

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
            raise HTTPException(status_code=400, detail="Invalid token response")

        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_json['access_token']}"}
        )
        user_info = user_info_response.json()

        user_id = user_info['sub']  # google 사용자 고유 ID는 sub 필드에 저장됨
        user_name = user_info['name']

        print(user_info['sub'])
        print(user_info['name'])
        
        user_sessions[user_id] = user_info

        conn = db_connect()
        conn.execute(
            'INSERT OR IGNORE INTO user (user_id, userName) VALUES (?, ?)', 
            (user_id, user_name)
        )
        conn.commit()
        conn.close()

        response = RedirectResponse(url="http://localhost:3000/")
        max_age = 30000 
        response.set_cookie(key="user_id", value=user_id, max_age=max_age)
        
        return response

@app.put("/user/update")
def update_user_hakbun(request: PersonalInformation):
    conn = db_connect()
    cursor = conn.cursor()
    
    query = """
    UPDATE user
    SET userHakbun = ?,
        userIsForeign = ?,
        userBunban = ?,
        userYear = ?,
        userMajor = ?,
        userIsMultipleMajor = ?,
        userWhatMultipleMajor = ?,
        userTakenLecture = ?
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
        request.userTakenLecture,
        request.user_id
    ))
    
    conn.commit()
    conn.close()
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="user not found")
    
    return {"message": "updated"}

@app.get("/user/data", response_model=List[PersonalInformation])
async def get_user_data(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in cookies")
    
    conn = db_connect()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM user WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    
    users = [PersonalInformation(**dict(row)) for row in rows]
    
    conn.close()
    
    return users

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
