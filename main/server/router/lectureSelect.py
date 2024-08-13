from typing import List
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import LectureSelect, userID

router = APIRouter()


@router.post("/lecture_select")
async def get_lectures(request: LectureSelect):
    conn = db_connect()
    cursor = conn.cursor()

    user_info = request.user_id
    get_lecNumber = request.lecNumber
    get_year = request.year
    get_semester = request.semester

    cursor.execute(
        "SELECT year, semester, lecNumber, lecName, lecTime, lecClassroom FROM LectureList WHERE year = ? AND semester = ? AND lecNumber = ?",
        (get_year, get_semester, get_lecNumber)
    )
    lecture = cursor.fetchone()

    if not lecture:
        raise HTTPException(status_code=434, detail="if not lecture")

    year, semester, lecNumber, lecName, lecTime, lecClassroom = lecture

    try:
        cursor.execute(
            """
            INSERT INTO UserListedLecture (user_id, year, semester, lecNumber, lecName, lecTime, classroom)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_info, year, semester, lecNumber, lecName, lecTime, lecClassroom)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail="select" + str(e))
    finally:
        cursor.close()
        conn.close()

    return {"detail": "selected"}


@router.post("/lecture_unselect")
async def unselect_lecture(request: LectureSelect):
    conn = db_connect()
    cursor = conn.cursor()

    user_info = request.user_id
    get_lecNumber = request.lecNumber
    get_year = request.year
    get_semester = request.semester

    try:
        cursor.execute(
            "DELETE FROM UserListedLecture WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?",
            (user_info, get_lecNumber, get_year, get_semester)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=434, detail="cursor.rowcout == 0")

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail="unselect" + str(e))
    finally:
        cursor.close()
        conn.close()

    return {"detail": "unselected"}


@router.post("/selected_lecture")
async def selected_lecture(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT year, semester, lecNumber FROM UserListedLecture WHERE user_id = ?", (request.user_id,))
    lectures = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"lectures": [{"year": lec[0], "semester": lec[1], "lecNumber": lec[2]} for lec in lectures]}
