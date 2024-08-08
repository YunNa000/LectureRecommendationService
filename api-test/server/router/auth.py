from fastapi import APIRouter, Cookie, HTTPException, Response
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

user_sessions = {}

REDIRECTRESPONSE = "http://localhost:3000/"


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

        user_id = user_info['sub']
        user_name = user_info.get('name', 'Unknown')

        conn = db_connect()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM user WHERE user_id = ?', (user_id,))
        user = cursor.fetchone()

        if not user:
            cursor.execute(
                'INSERT INTO user (user_id, userName) VALUES (?, ?)',
                (user_id, user_name)
            )
            conn.commit()

        conn.close()

        user_sessions[user_id] = user_info

        response = RedirectResponse(url=REDIRECTRESPONSE)
        max_age = 300000
        response.set_cookie(key="user_id", value=user_id, max_age=max_age)

        return response


@router.post("/logout")
async def logout(user_id: str = Cookie(None)):
    print(user_id)
    if user_id:
        response = JSONResponse(
            content={"message": "log out!"}, status_code=200)
        response.delete_cookie(key="user_id")
        return response
    raise HTTPException(status_code=400, detail="User not logged in")


@router.post("/delete_account")
async def delete_account(user_id: str = Cookie(None)):
    if user_id:
        conn = db_connect()
        conn.execute('DELETE FROM user WHERE user_id = ?', (user_id,))
        conn.commit()
        conn.close()

        response = JSONResponse(
            content={"message": "deleted!"}, status_code=200)
        response.delete_cookie(key="user_id")
        return response
    raise HTTPException(status_code=400, detail="User not logged in")
