from fastapi import FastAPI, HTTPException, Request, Query,APIRouter
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

router = APIRouter()

#손원택 작성
class User(BaseModel):
    user_id: int
    userName: str

def get_db_connection():
    conn = sqlite3.connect('./kwu-lecture-database-v6.db')
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/users", response_model=list[User])
async def get_users(userName: Optional[str] = Query(None, description="Filter users by userName")):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if userName:
            cursor.execute("SELECT user_id, userName FROM user WHERE userName LIKE ?", (f"%{userName}%",))
        else:
            cursor.execute("SELECT user_id, userName FROM user")

        users = cursor.fetchall()
        
        if not users:
            raise HTTPException(status_code=404, detail="No users found")
        
        return [User(user_id=user['user_id'], userName=user['userName']) for user in users]
    
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()

@router.get("/friends", response_model=list[User])
async def get_users(userName: Optional[str] = Query(None, description="Filter users by userName")):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if userName:
            cursor.execute("SELECT user_id, userName FROM friend WHERE userName LIKE ?", (f"%{userName}%",))
        else:
            cursor.execute("SELECT user_id, userName FROM user")

        users = cursor.fetchall()
        
        if not users:
            raise HTTPException(status_code=404, detail="No users found")
        
        return [User(user_id=user['user_id'], userName=user['userName']) for user in users]
    
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()

class FriendRequest(BaseModel):
    user_id1: str
    user_id2: str

@router.post("/add_friend")
async def add_friend(request: FriendRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 먼저 이미 친구 관계가 있는지 확인
        cursor.execute("SELECT * FROM friend WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)",
                       (request.user_id1, request.user_id2, request.user_id2, request.user_id1))
        existing_friend = cursor.fetchone()
        
        if existing_friend:
            return {"message": "These users are already friends"}

        cursor.execute("SELECT * FROM friend WHERE (user_id2 = ? AND user_id1 = ?) OR (user_id2 = ? AND user_id1 = ?)",
                       (request.user_id1, request.user_id2, request.user_id2, request.user_id1))
        mutality = cursor.fetchone()
        
        if mutality:
        # 친구 관계 추가
            cursor.execute("INSERT INTO friend (user_id1, user_id2, mutality ) VALUES (?, ?, ?)",
                        (request.user_id1, request.user_id2, True))
            conn.commit()
            cursor.execute("INSERT INTO friend (user_id1, user_id2, mutality ) VALUES (?, ?, ?)",
                        (request.user_id2, request.user_id1, True))
            cursor.execute("""
            UPDATE friend 
            SET mutality = TRUE 
            WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)
            """, (request.user_id1, request.user_id2, request.user_id2, request.user_id1))
            conn.commit()
            return {"message": "Mutality Success"}
        
        # 친구 관계 추가
        cursor.execute("INSERT INTO friend (user_id1, user_id2, mutality) VALUES (?, ?, ?)",
                       (request.user_id1, request.user_id2, False))
        conn.commit()
        
        return {"message": "Friend added successfully"}
    
    except sqlite3.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()