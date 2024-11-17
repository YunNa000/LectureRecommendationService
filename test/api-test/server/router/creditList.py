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
    totalGPA: float
    junGPA: float


@router.get("/creditList", response_model=GradesCreditResponse)
def read_gradesCredit(request: Request, table: str = "UserTakenLecture") -> GradesCreditResponse:
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="no exist user id")

    conn = db_connect()
    cursor = conn.cursor()

    query = f"""
    SELECT
        SUM(lecCredit) AS total_credit,
        SUM(CASE WHEN Classification IN ('전필', '전선') THEN lecCredit ELSE 0 END) AS major_credit,
        SUM(CASE WHEN Classification IN ('교필', '교선') THEN lecCredit ELSE 0 END) AS general_credit,
        SUM(CASE WHEN Classification NOT IN ('전필', '전선', '교필', '교선') THEN lecCredit ELSE 0 END) AS other_credit
    FROM {table}
    WHERE user_id = ?;
    """

    cursor.execute(query, (user_id,))
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

    cursor.execute(
        "SELECT totalGPA, majorGPA FROM User WHERE user_id = ?", (user_id,))
    gpa_row = cursor.fetchone()
    print(f"GPA Query result: {gpa_row}")

    if gpa_row:
        result["totalGPA"] = gpa_row[0] or 0
        result["junGPA"] = gpa_row[1] or 0
    else:
        result["totalGPA"] = 0
        result["junGPA"] = 0

    conn.close()

    return GradesCreditResponse(**result)
