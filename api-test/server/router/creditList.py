from fastapi import FastAPI, HTTPException, Request, APIRouter
from pydantic import BaseModel
import sqlite3
from db import db_connect
from model import GradesCreditResponse

router = APIRouter()


@router.get("/creditList", response_model=GradesCreditResponse)
def read_gradesCredit(request: Request, table: str = "userTakenLecture") -> GradesCreditResponse:
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="no exist user di")

    conn = db_connect()
    cursor = conn.cursor()

    query = f"""
    SELECT
        SUM(takenLecCredit) AS total_credit,
        SUM(CASE WHEN takenLecClassification IN ('전필', '전선') THEN takenLecCredit ELSE 0 END) AS major_credit,
        SUM(CASE WHEN takenLecClassification IN ('교필', '교선') THEN takenLecCredit ELSE 0 END) AS general_credit,
        SUM(CASE WHEN takenLecClassification NOT IN ('전필', '전선', '교필', '교선') THEN takenLecCredit ELSE 0 END) AS other_credit
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
        "SELECT totalGPA, junGPA FROM user WHERE user_id = ?", (user_id,))
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
