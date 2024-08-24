from typing import List
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import userID, PriorityUpdate, ManuallyAddListedLecture, ListedLecturInfoUpdate
import random
import string

router = APIRouter()


@router.post("/user/listed_lecture")
async def user_listed_lecture(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT year, semester, lecNumber, priority, classroom, memo, lecName, lecTime, isLecClose, lecClassification, lecCredit FROM UserListedLecture WHERE user_id = ?", (request.user_id,))
    user_lectures = cursor.fetchall()

    results = []

    for lecture in user_lectures:
        year, semester, lecNumber, priority, classroom, memo, lecName, lecTime, isLecClose, lecClassification, lecCredit = lecture
        print("is lec close?", isLecClose)

        if lecNumber.startswith("user"):
            results.append({
                "year": year,
                "semester": semester,
                "lecNumber": lecNumber,
                "priority": priority,
                "classroom": classroom,
                "memo": memo,
                "lecName": lecName,
                "lecTime": lecTime,
                "lecTheme": "",
                "lecClassification": "",
                "lecCredit": "",
                "star": "",
                "assignmentAmount": "",
                "teamPlayAmount": "",
                "gradeAmount": "",
                "reviewSummary": "",
                "lecClassification": lecClassification,
                "lecCredit": lecCredit
            })
        else:
            cursor.execute(
                "SELECT lecTheme, lecClassification, lecCredit, lecProfessor FROM LectureList WHERE year = ? AND semester = ? AND lecNumber = ?",
                (year, semester, lecNumber))
            lecture_list = cursor.fetchone()

            if lecture_list:
                lecTheme, lecClassification, lecCredit, lecProfessor = lecture_list

                cursor.execute(
                    "SELECT star, assignmentAmount, teamPlayAmount, gradeAmount, reviewSummary FROM LectureEverytimeData WHERE lectureID = (SELECT lectureID FROM LectureList WHERE year = ? AND semester = ? AND lecNumber = ?)",
                    (year, semester, lecNumber))
                everytime_data = cursor.fetchone()

                if everytime_data:
                    star, assignmentAmount, teamPlayAmount, gradeAmount, reviewSummary = everytime_data

                    cursor.execute(
                        "UPDATE UserListedLecture SET lecCredit = ?, lecClassification = ? WHERE user_id = ? AND year = ? AND semester = ? AND lecNumber = ?",
                        (lecCredit, lecClassification,
                         request.user_id, year, semester, lecNumber)
                    )
                    conn.commit()

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
                        "lecCredit": lecCredit,
                        "star": star,
                        "assignmentAmount": assignmentAmount,
                        "teamPlayAmount": teamPlayAmount,
                        "gradeAmount": gradeAmount,
                        "reviewSummary": reviewSummary,
                        "lecProfessor": lecProfessor,
                        "isLecClose": isLecClose,
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
            existing_priority = result[0] or ""
            new_priority = request.priority.strip()

            priorities = set(existing_priority.split()
                             ) if existing_priority else set()

            if new_priority in priorities:
                priorities.remove(new_priority)
            else:
                priorities.add(new_priority)

            updated_priority = ' '.join(
                sorted(priorities, key=lambda x: (x != new_priority, x)))

            cursor.execute(update_query, (updated_priority, request.user_id,
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


@router.post("/user/add_user_listed_lecture_manually")
async def add_user_listed_lecture_manually(request: ManuallyAddListedLecture):
    conn = db_connect()
    cursor = conn.cursor()

    random_string = ''.join(random.choices(
        string.ascii_letters + string.digits, k=6))
    lecNumber = f"user-{request.year}-{request.semester}-{random_string}"

    insert_query = """
    INSERT INTO UserListedLecture (user_id, year, semester, priority, classroom, memo, lecName, lecTime, lecNumber, lecClassification, lecCredit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    try:
        cursor.execute(insert_query, (
            request.user_id,
            request.year,
            request.semester,
            "",
            request.classroom,
            request.memo,
            request.lecName,
            request.lecTime,
            lecNumber,
            request.lecClassification,
            request.lecCredit,
        ))
        conn.commit()

        return {"detail": "add lecture manually done", "lecNumber": lecNumber}

    except Exception as e:
        conn.rollback()
        print(f"err add lecture manually: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"err add lecture manually: {str(e)}"
        )

    finally:
        cursor.close()
        conn.close()


@router.post("/user/update_user_listed_lecture_info")
async def update_user_listed_lecture_info(request: ListedLecturInfoUpdate):
    conn = db_connect()
    cursor = conn.cursor()

    update_query = """
    UPDATE UserListedLecture
    SET memo = ?, classroom = ?
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """

    try:

        cursor.execute(update_query, (request.memo, request.classroom,
                                      request.user_id, request.lecNumber,
                                      request.year, request.semester))

        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=434, detail="cursor.rowcount == 0")

        return {"detail": "lecture info updated"}

    except Exception as e:

        conn.rollback()
        print(f"err update lecture info: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"err update lecture info: {str(e)}")

    finally:
        cursor.close()
        conn.close()
