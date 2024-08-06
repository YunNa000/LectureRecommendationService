from fastapi import FastAPI, HTTPException, Request, Depends, Cookie, APIRouter
from pydantic import BaseModel
import sqlite3
from typing import List, Dict
import uvicorn
import os
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.responses import RedirectResponse
import httpx
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from db import db_connect

router = APIRouter()

@router.get("/gradesCredit")
def read_gradesCredit(request: Request, table: str = "userTakenLecture") -> List[Dict]:
    
    user_id = request.cookies.get("user_id")
    print(f"|-- /user/data | user_id: {user_id}")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")
    
    conn = db_connect()
    cursor = conn.cursor()
    
    query = f"""
    SELECT
        SUM(takenLecCredit) AS total_credit,
        SUM(CASE WHEN takenLecClassification IN ('전필', '전선') THEN takenLecCredit ELSE 0 END) AS major_credit,
        SUM(CASE WHEN takenLecClassification IN ('교필', '교선') THEN takenLecCredit ELSE 0 END) AS general_credit,
        SUM(CASE WHEN takenLecClassification NOT IN ('전필', '전선', '교필', '교선') THEN takenLecCredit ELSE 0 END) AS other_credit
    FROM {table};
    """
    
    cursor.execute(query)
    
    rows = cursor.fetchall()

    
    result = {"total": 0, "major": 0, "general": 0, "other": 0}
    
    for row in rows:
        classification = row["takenLecClassification"]
        credits = row["total_credit"]
        result["total"] += credits
        if classification in ['전필', '전선']:
            result["major"] += credits
        elif classification in ['교필', '교선']:
            result["general"] += credits
        else:
            result["other"] += credits
    
    conn.close()
    
    return result

