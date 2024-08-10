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
from db import db_connect



router = APIRouter()

#손원택 작성
class User(BaseModel):
    user_id: str
    userName: Optional[str] = None  
    userMajor: Optional[str] = None

class FriendRequest(BaseModel):
    user_id1: str
    user_id2: str
    friendRequest: Optional[bool] = None  

# def get_db_connection():
#     conn = sqlite3.connect('./kwu-lecture-database-v6.db')
#     conn.row_factory = sqlite3.Row
#     return conn

@router.get("/users", response_model=list[User])
async def get_users(userName: Optional[str] = Query(None, description="Filter users by userName")):
    conn = db_connect()
    cursor = conn.cursor()
    #친구검색 허용 토글 추가
    try:
        if userName:
            cursor.execute("SELECT user_id, userName,userMajor FROM user WHERE userName LIKE ?", (f"%{userName}%",))
        else:
            cursor.execute("SELECT user_id, userName, userMajor FROM user")

        users = cursor.fetchall()
        
        if not users:
            raise HTTPException(status_code=404, detail="No users found")
        
        return [User(user_id=user['user_id'], userName=user['userName'], userMajor=user['userMajor']) for user in users]
    
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()

@router.get("/friends", response_model=List[User])
async def get_friends(
    userId: str = Query(..., description="User ID to get friends for"),
    userName: Optional[str] = Query(None, description="Filter friends by userName"),
):
    conn = db_connect()
    cursor = conn.cursor()
    
    try:
        if userName:
            cursor.execute("""
                SELECT f.user_id2, u.userName, u.userMajor
                FROM friend f
                JOIN user u ON f.user_id2 = u.user_id
                WHERE f.user_id1 = ? AND u.userName LIKE ? AND f.mutality = TRUE
            """, (userId, f"%{userName}%"))
        else:
            cursor.execute("""
                SELECT f.user_id2, u.userName, u.userMajor
                FROM friend f
                JOIN user u ON f.user_id2 = u.user_id
                WHERE f.user_id1 = ?  AND f.mutality = TRUE
            """,(userId,))
        friends = cursor.fetchall()
        
        if not friends:
            raise HTTPException(status_code=404, detail="No friends found")

        return [User(user_id=friend['user_id2'], userName=friend['userName'],  userMajor=friend['userMajor']) for friend in friends]
    
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()


@router.get("/friendrequest", response_model=List[User])
async def get_friends(
    userId: str = Query(..., description="User ID to get friends for"),
    userName: Optional[str] = Query(None, description="Filter friends by userName")
):
    conn = db_connect()
    cursor = conn.cursor()
    
    try:
        if userName:
            cursor.execute("""
                SELECT f.user_id2, u.userName, u.userMajor
                FROM friend f
                JOIN user u ON f.user_id2 = u.user_id
                WHERE f.user_id1 = ? AND u.userName LIKE ? AND f.mutality = FALSE
            """, (userId, f"%{userName}%"))
        else:
            cursor.execute("""
                SELECT f.user_id1, u.userName, u.userMajor
                FROM friend f
                JOIN user u ON f.user_id1 = u.user_id AND f.mutality = FALSE
                WHERE f.user_id2 = ?
            """,(userId,))
        friends = cursor.fetchall()
        
        if not friends:
            raise HTTPException(status_code=404, detail="No friends found")

        return [User(user_id=friend['user_id1'], userName=friend['userName'], userMajor=friend['userMajor']) for friend in friends]
    
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()



@router.post("/add_friend")
async def add_friend(request: FriendRequest):
    conn = db_connect()
    cursor = conn.cursor()
    
    try:
        # 먼저 이미 팔로우 관계가 있는지 확인
        cursor.execute("SELECT * FROM friend WHERE (user_id1 = ? AND user_id2 = ?)",
                       (request.user_id1, request.user_id2))
        existing_friend = cursor.fetchone()
        
        if existing_friend:
            return {"message": "These users are already friends"}

        cursor.execute("SELECT * FROM friend WHERE (user_id2 = ? AND user_id1 = ?)",
                       (request.user_id1, request.user_id2))
        mutality = cursor.fetchone()
        
        if mutality:
        # 친구 관계 추가
            cursor.execute("INSERT INTO friend (user_id1, user_id2, mutality ) VALUES (?, ?, ?)",
                        (request.user_id1, request.user_id2, True))
            conn.commit()
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



@router.post("/delete_friend")
async def delete_friend(request: FriendRequest):
    conn = db_connect()
    cursor = conn.cursor()
    
    try:
        # 먼저 이미 친구 관계가 있는지 확인
        cursor.execute("SELECT * FROM friend WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)",
                    (request.user_id1, request.user_id2, request.user_id2, request.user_id1))
        existing_friend = cursor.fetchone()

        if existing_friend:
            if existing_friend['mutality']:
                # mutality가 있을 때
                # 상대방의 친구 관계 mutality를 False로 업데이트
                cursor.execute("""
                    DELETE FROM friend 
                    WHERE user_id1 = ? OR user_id2 = ?
                """, (request.user_id2, request.user_id1))

                # 내 친구 관계 삭제
                cursor.execute("""
                    DELETE FROM friend 
                    WHERE user_id1 = ? OR user_id2 = ?
                """, (request.user_id1, request.user_id2))

                conn.commit()
                return {"message": "Mutual friend relationship removed and other side updated"}
            else:
                # mutality가 없을 때
                # 그냥 요청 삭제
                cursor.execute("""
                    DELETE FROM friend 
                    WHERE user_id1 = ? OR user_id2 = ?
                """, (request.user_id2, request.user_id1))

                # 내 친구 관계 삭제
                cursor.execute("""
                    DELETE FROM friend 
                    WHERE user_id1 = ? OR user_id2 = ?
                """, (request.user_id1, request.user_id2))
                conn.commit()
                return {"message": "Friend request removed"}
        else:
            return {"message": "No friend relationship found"}
    
    except sqlite3.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    finally:
        cursor.close()
        conn.close()


@router.post("/set_friendrequest")#boolean이랑 아이디 받아서 친구요청 수락
async def delete_friend(request: FriendRequest):
    return {"message": "Friend request removed"}
