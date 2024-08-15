from typing import List
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import userID, PriorityUpdate

router = APIRouter()


@router.post("/user/listed_lecture")
async def user_listed_lecture(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT year, semester, lecNumber, priority, classroom, memo, lecName, lecTime FROM UserListedLecture WHERE user_id = ?", (request.user_id,))
    user_lectures = cursor.fetchall()

    results = []

    for lecture in user_lectures:
        year, semester, lecNumber, priority, classroom, memo, lecName, lecTime = lecture

        cursor.execute(
            "SELECT lecTheme, lecClassification FROM LectureList WHERE year = ? AND semester = ? AND lecNumber = ?",
            (year, semester, lecNumber))
        lecture_list = cursor.fetchone()

        if lecture_list:
            lecTheme, lecClassification = lecture_list

            cursor.execute(
                "SELECT star, assignmentAmount, teamPlayAmount, gradeAmount, reviewSummary, everytimeURL FROM LectureEverytimeData WHERE lectureID = (SELECT lectureID FROM LectureList WHERE year = ? AND semester = ? AND lecNumber = ?)",
                (year, semester, lecNumber))
            everytime_data = cursor.fetchone()

            if everytime_data:
                star, assignmentAmount, teamPlayAmount, gradeAmount, reviewSummary, everytimeURL = everytime_data

                results.append({
                    "year": year,
                    "semester": semester,
                    "lecNumber": lecNumber,
                    "priority": priority,
                    "classroom": classroom,
                    "memo": memo,
                    "lecName": lecName,
                    "lecTime": lecTime,
                    "lecTheme": lecTheme,
                    "lecClassification": lecClassification,
                    "star": star,
                    "assignmentAmount": assignmentAmount,
                    "teamPlayAmount": teamPlayAmount,
                    "gradeAmount": gradeAmount,
                    "reviewSummary": reviewSummary,
                })

    conn.close()
    return results


@router.post("/user/update_listed_lecture_priority")
async def update_user_listed_lecture_priority(request: PriorityUpdate):
    conn = db_connect()
    cursor = conn.cursor()

    select_query = """
    SELECT priority FROM UserListedLecture
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """

    update_query = """
    UPDATE UserListedLecture
    SET priority = ?
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """

    try:
        cursor.execute(select_query, (request.user_id,
                       request.lecNumber, request.year, request.semester))
        result = cursor.fetchone()

        if result:
            existing_priority = result[0]
            new_priority = request.priority

            if new_priority in existing_priority.split():
                existing_priority = ' '.join(
                    p for p in existing_priority.split() if p != new_priority
                )
            else:
                existing_priority += f" {new_priority}".strip()

            cursor.execute(update_query, (existing_priority, request.user_id,
                           request.lecNumber, request.year, request.semester))
            conn.commit()

            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=434, detail="cursor.rowcount == 0")

            return {"detail": "priority updated"}

        else:
            raise HTTPException(status_code=404, detail="Lecture not found")

    except Exception as e:
        conn.rollback()
        print(f"errr updating priority {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"errr updating priority {str(e)}")

    finally:
        cursor.close()
        conn.close()
