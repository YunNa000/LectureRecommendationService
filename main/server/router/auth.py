import hashlib
from fastapi import APIRouter, Request, Cookie, HTTPException, Response
from model import LoggedInResponse, NotLoggedInResponse
from typing import Union
from fastapi.responses import RedirectResponse, JSONResponse
import os
from dotenv import load_dotenv
from db import db_connect
import httpx

router = APIRouter()

load_dotenv()

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_RESPONSE = os.getenv("REDIRECT_RESPONSE")
REDIRECT_URL = os.getenv("REDIRECT_URL")

user_sessions = {}


def hash_user_id(user_id: str) -> str:
    return hashlib.sha256(user_id.encode()).hexdigest()


@router.get("/", response_model=Union[LoggedInResponse, NotLoggedInResponse])
async def root(user_id: str = Cookie(None)):
    conn = db_connect()
    cursor = conn.cursor()

    if user_id:
        cursor.execute(
            "SELECT userName FROM User WHERE user_id = ?", (user_id,))
        user = cursor.fetchone()

        if user:
            userName = user[0]
            return LoggedInResponse(message="log in", user_id=user_id, userName=userName)

    return NotLoggedInResponse(message="log in required")


@router.get("/login")
async def login():
    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/auth?client_id={client_id}&redirect_uri={REDIRECT_URL}&scope=openid%20profile%20email&response_type=code"
    )


@router.get("/auth/callback")
async def auth_callback(code: str):
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": REDIRECT_URL,
                "grant_type": "authorization_code",
            },
        )
        token_json = token_response.json()
        if "access_token" not in token_json:
            raise HTTPException(
                status_code=400, detail="Invalid token response"
            )

        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_json['access_token']}"}
        )
        user_info = user_info_response.json()

        user_id = user_info['sub']
        hashed_user_id = hash_user_id(user_id)
        user_name = user_info.get('name', 'Unknown')

        conn = db_connect()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM user WHERE user_id = ?',
                       (hashed_user_id,))
        user = cursor.fetchone()

        if not user:
            cursor.execute(
                '''
                INSERT INTO user (
                    user_id, hakBun, isForeign, bunban, userYear, 
                    userMajor, isMultipleMajor, whatMultipleMajor, 
                    userName, whatMultipleMajorDepartment, totalGPA, majorGPA
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    hashed_user_id, '', False, '', '', '', False, '',
                    user_name, '', 0.0, 0.0
                )
            )
            conn.commit()

        conn.close()

        user_sessions[hashed_user_id] = user_info

        response = RedirectResponse(url=REDIRECT_RESPONSE)
        max_age = 300000
        response.set_cookie(key="user_id", value=hashed_user_id,
                            max_age=max_age)

        return response
