from fastapi import APIRouter, Cookie, FastAPI, Depends, HTTPException, Cookie
from model import LoggedInResponse, NotLoggedInResponse
from typing import Union
from fastapi.responses import RedirectResponse
import os
from dotenv import load_dotenv
from db import db_connect
import httpx

router = APIRouter()

load_dotenv()

# 노션 - 기타 - api key 참고
client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")


user_sessions = {}


@router.get("/", response_model=Union[LoggedInResponse, NotLoggedInResponse])
async def root(user_id: str = Cookie(None)):  # 쿠키에서 user_id 가져옴, 없으면 None
    if user_id and user_id in user_sessions:
        return {
            "user_id": user_id
        }
    return {"message": "log in required"}


@router.get("/login")
async def login():
    redirect_uri = "http://localhost:8000/auth/callback"
    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/auth?client_id={client_id}&redirect_uri={redirect_uri}&scope=openid%20profile%20email&response_type=code"
    )


@router.get("/auth/callback")
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
        max_age = 300000
        response.set_cookie(key="user_id", value=user_id, max_age=max_age)

        return response  # 쿠키 return
