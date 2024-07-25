import os
import sqlite3
from fastapi import FastAPI, Depends, HTTPException, Cookie
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.responses import RedirectResponse
import httpx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

user_sessions = {}

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="",
    tokenUrl="",
)

DATABASE = './kwu-lecture-database-v3.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
async def root(user_id: str = Cookie(None)):
    if user_id and user_id in user_sessions:
        return {"message": f"Hello, {user_sessions[user_id]['email']}!"}
    return {"message": "Hello, World! Please log in."}

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

        user_id = user_info['sub']  # Google 사용자 고유 ID는 sub 필드에 저장됨
        
        user_sessions[user_id] = user_info

        conn = get_db_connection()
        conn.execute('INSERT OR IGNORE INTO user (user_id) VALUES (?)', (user_id,))
        conn.commit()
        conn.close()

        response = RedirectResponse(url="/")
        response.set_cookie(key="user_id", value=user_id)
        
        return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
