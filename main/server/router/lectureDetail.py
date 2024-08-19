from fastapi import FastAPI, HTTPException, APIRouter
from db import db_connect

router = APIRouter()

@router.get("/lecture/{year}/{semester}/{lecture_number}")
async def get_lecture(year: int, semester: str, lecture_number: str):
    query = """
    SELECT lecName FROM LectureList WHERE lecNumber = ? AND year = ? AND semester = ?
    """
    
    conn = db_connect()
    cursor = conn.cursor()
    cursor.execute(query, (lecture_number, year, semester))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Lecture not found")

    return {"lecName": row[0]}  # S