from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
import sqlite3
from db import db_connect

router = APIRouter()


class UserInfoResponse(BaseModel):
    name: str
    major: str
    hakbun: str
    multiplemajor: str | None


@router.get("/userInfo", response_model=UserInfoResponse)
def read_userInfo(table: str = "user") -> UserInfoResponse:
    conn = db_connect()
    cursor = conn.cursor()

    query = f"""
    SELECT 
        userName, userMajor, hakBun, whatMultipleMajor
    FROM {table}
    LIMIT 1
    """

    cursor.execute(query)
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    result = UserInfoResponse(
        name=row[0],
        major=row[1],
        hakbun=str(row[2]),
        multiplemajor=row[3] if row[3] is not None else ""
    )

    conn.close()

    return result
