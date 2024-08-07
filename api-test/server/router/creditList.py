from fastapi import FastAPI, HTTPException, Request, APIRouter
from pydantic import BaseModel
import sqlite3
from db import db_connect

router = APIRouter()

class GradesCreditResponse(BaseModel):
    total: int
    major: int
    general: int
    other: int

@router.get("/creditList", response_model=GradesCreditResponse)
def read_gradesCredit(table: str = "userTakenLecture") -> GradesCreditResponse:
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
    row = cursor.fetchone()
    print(f"Query result: {row}")
    
    if row:
        result = {
            "total": row[0] or 0,
            "major": row[1] or 0,
            "general": row[2] or 0,
            "other": row[3] or 0
        }
    else:
        result = {"total": 0, "major": 0, "general": 0, "other": 0}
    
    conn.close()
    
    print(f"Result: {result}")
    
    return result
