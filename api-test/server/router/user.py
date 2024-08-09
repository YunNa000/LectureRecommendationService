from fastapi import APIRouter, Request, FastAPI, Depends, HTTPException, Cookie
from model import PersonalInformation, LecturesUpdateRequest, LectureListed, LectureCheckUpdateRequest, LectureCheckDeleteRequest, LecturePriorityUpdateRequest, LectureInfoUpdateRequest, LectureUserDone, LectureUserDoneLists
from typing import List
from db import db_connect
import sqlite3

router = APIRouter()


@router.get("/user/data", response_model=List[PersonalInformation])
async def get_user_data(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM user WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()

    if not rows:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    users = []
    for row in rows:
        user_dict = dict(row)
        print(user_dict)

        cursor.execute(
            "SELECT lecNumber FROM userListedLecture WHERE user_id = ?", (user_dict['user_id'],))
        lecNumbers = cursor.fetchall()
        user_dict['selectedLecNumbers'] = [lecNumber[0]
                                           for lecNumber in lecNumbers]

        cursor.execute(
            "SELECT takenLecName, takenLecClassification, takenLecCredit, userCredit, year, semester FROM userTakenLecture WHERE user_id = ?",
            (user_dict['user_id'],)
        )
        takenLectures = cursor.fetchall()
        user_dict['userTakenLectures'] = [
            {
                "lectureName": lecture[0],
                "lecClassification": lecture[1],
                "lecCredit": lecture[2],
                "userCredit": lecture[3],
                "year": lecture[4],
                "semester": lecture[5]
            }
            for lecture in takenLectures
        ]

        user_info = PersonalInformation(
            user_id=user_dict['user_id'],
            userHakbun=user_dict.get('userHakbun', 0),
            userIsForeign=user_dict.get('userIsForeign', False),
            userBunban=user_dict.get('userBunban', ""),
            userYear=user_dict.get('userYear', ""),
            userMajor=user_dict.get('userMajor', "_"),
            userIsMultipleMajor=user_dict.get('userIsMultipleMajor', False),
            userWhatMultipleMajor=user_dict.get('userWhatMultipleMajor'),
            userTakenLecture=user_dict.get('userTakenLecture'),
            userName=user_dict['userName'],
            selectedLecNumbers=user_dict.get('selectedLecNumbers', []),
            userTakenLectures=user_dict.get('userTakenLectures', []),
            userCredit=user_dict.get('userCredit'),
            userTotalGPA=user_dict.get('userTotalGPA', 0),
            userJunGPA=user_dict.get('userJunGPA', 0)
        )

        users.append(user_info)

    conn.close()

    return users


@router.put("/user/update")
async def update_user_hakbun(request: PersonalInformation):
    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM user WHERE userName = ? AND user_id != ?",
                   (request.userName, request.user_id))
    count = cursor.fetchone()[0]

    if count > 0:
        conn.close()
        raise HTTPException(
            status_code=400, detail="userName is duplicated")

    query = """
    UPDATE user
    SET userHakbun = ?,
        userIsForeign = ?,
        userBunban = ?,
        userYear = ?,
        userMajor = ?,
        userIsMultipleMajor = ?,
        userWhatMultipleMajor = ?,
        userName = ?
    WHERE user_id = ?
    """

    cursor.execute(query, (
        request.userHakbun,
        request.userIsForeign,
        request.userBunban,
        request.userYear,
        request.userMajor,
        request.userIsMultipleMajor,
        request.userWhatMultipleMajor,
        request.userName,
        request.user_id
    ))

    if cursor.rowcount == 0:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=404, detail="user not found")

    cursor.execute(
        "DELETE FROM userTakenLecture WHERE user_id = ?", (request.user_id,))

    if request.userTakenLectures:
        query = """
        INSERT INTO userTakenLecture (user_id, takenLecName, takenLecClassification, takenLecCredit, userCredit)
        VALUES (?, ?, ?, ?, ?)
        """
        for lecture in request.userTakenLectures:
            cursor.execute(query, (
                request.user_id,
                lecture.get('lectureName'),
                lecture.get('lecClassification'),
                lecture.get('lecCredit'),
                lecture.get('userCredit')
            ))

    # 여기 D+?이랑 D의 경우, NP와 P, F의 경우 등 고려해보는 것이 필요해요.
    grade_to_points = {
        "A+": 4.5,
        "A": 4.0,
        "B+": 3.5,
        "B": 3.0,
        "C+": 2.5,
        "C": 2.0
    }

    cursor.execute(
        "SELECT takenLecClassification, takenLecCredit, userCredit FROM userTakenLecture WHERE user_id = ?", (request.user_id,))
    lectures = cursor.fetchall()

    total_points = 0
    total_credits = 0
    major_points = 0
    major_credits = 0

    for lec in lectures:
        classification, credit, grade = lec
        if grade in grade_to_points:
            points = grade_to_points[grade]
            total_points += points * credit
            total_credits += credit
            if classification in ["전필", "전선"]:
                major_points += points * credit
                major_credits += credit

    total_gpa = total_points / total_credits if total_credits > 0 else 0
    major_gpa = major_points / major_credits if major_credits > 0 else 0

    total_gpa = round(total_gpa, 2)
    major_gpa = round(major_gpa, 2)

    cursor.execute("""
    UPDATE user
    SET totalGPA = ?, junGPA = ?
    WHERE user_id = ?
    """, (total_gpa, major_gpa, request.user_id))

    conn.commit()
    conn.close()

    return {"message": "updated"}


@router.post("/user/update_select_lectures")
async def update_selected_lectures(request: LecturesUpdateRequest):
    user_id = request.userId

    if not user_id:
        raise HTTPException(status_code=403, detail="login required")

    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM user WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="not user")

    cursor.execute('''
    SELECT lecNumber FROM userListedLecture WHERE user_id = ?
    ''', (user_id,))
    current_lectures = cursor.fetchall()
    current_lectures = {lec[0] for lec in current_lectures}

    incoming_lectures = set(request.lecNumbers)

    lectures_to_add = incoming_lectures - current_lectures
    lectures_to_remove = current_lectures - incoming_lectures

    for lecNumber in lectures_to_add:
        try:
            cursor.execute('''
            SELECT year, semester, lecClassRoom, lecClassName, lecTime FROM LectureTable WHERE lecNumber = ?
            ''', (lecNumber,))
            lecture_info = cursor.fetchone()
            if lecture_info:
                year, semester, lecClassRoom, lecClassName, lecTime = lecture_info
                cursor.execute('''
                INSERT INTO userListedLecture (user_id, lecNumber, year, semester, userListedLecClassRoom, userListedLecName, userListedLecTime) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (user_id, lecNumber, year, semester, lecClassRoom, lecClassName, lecTime))
        except sqlite3.IntegrityError:
            continue

    for lecNumber in lectures_to_remove:
        cursor.execute('''
        DELETE FROM userListedLecture WHERE user_id = ? AND lecNumber = ?
        ''', (user_id, lecNumber))

    conn.commit()
    conn.close()

    return {"message": "updated update_select_lectures"}


@router.get("/user/data/listed_lectures_data", response_model=List[LectureListed])
async def listed_lectures_data(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    count_query = "SELECT COUNT(*) FROM userListedLecture WHERE user_id = ?"
    cursor.execute(count_query, (user_id,))
    count_result = cursor.fetchone()
    count = count_result[0] if count_result else 0

    if count == 0:
        raise HTTPException(status_code=454, detail="선택한 강의가 없어요.")

    query = """
    SELECT ull.userListedLecName, lt.lecNumber, lt.lecProfessor, ull.userListedLecTime, lt.lecClassification, lt.lecStars,
           lt.lecAssignment, lt.lecTeamplay, lt.lecGrade, lt.lecIsPNP, lt.lecCredit, lt.lecIsTBL, lt.lecIsPBL,
           lt.lecIsSeminar, lt.lecIsSmall, lt.lecIsConvergence, lt.lecIsArt, lt.lecSubName, lt.year, lt.semester, ull.isChecked, ull.priority, ull.userListedLecClassRoom, ull.userListedLecMemo
    FROM userListedLecture ull
    JOIN LectureTable lt ON ull.lecNumber = lt.lecNumber
    WHERE ull.user_id = ?
    """
    cursor.execute(query, (user_id,))
    lectures = cursor.fetchall()

    user_listed_lectures = []
    for lecture in lectures:
        user_listed_lectures.append({
            "userListedLecName": lecture["userListedLecName"] if lecture["userListedLecName"] else "값이 비었어요",
            "lecNumber": lecture["lecNumber"] if lecture["lecNumber"] else "값이 비었어요",
            "lecProfessor": lecture["lecProfessor"] if lecture["lecProfessor"] else "값이 비었어요",
            "userListedLecTime": lecture["userListedLecTime"] if lecture["userListedLecTime"] else "값이 비었어요",
            "lecClassification": lecture["lecClassification"] if lecture["lecClassification"] else "값이 비었어요",
            "lecStars": lecture["lecStars"] if lecture["lecStars"] else None,
            "lecAssignment": int(lecture["lecAssignment"]) if lecture["lecAssignment"] is not None else None,
            "lecTeamplay": int(lecture["lecTeamplay"]) if lecture["lecTeamplay"] is not None else None,
            "lecGrade": int(lecture["lecGrade"]) if lecture["lecGrade"] is not None else None,
            "lecIsPNP": int(lecture["lecIsPNP"]) if lecture["lecIsPNP"] is not None else None,
            "lecCredit": int(lecture["lecCredit"]) if lecture["lecCredit"] is not None else None,
            "lecIsTBL": int(lecture["lecIsTBL"]) if lecture["lecIsTBL"] is not None else None,
            "lecIsPBL": int(lecture["lecIsPBL"]) if lecture["lecIsPBL"] is not None else None,
            "lecIsSeminar": int(lecture["lecIsSeminar"]) if lecture["lecIsSeminar"] is not None else None,
            "lecIsSmall": int(lecture["lecIsSmall"]) if lecture["lecIsSmall"] is not None else None,
            "lecIsConvergence": int(lecture["lecIsConvergence"]) if lecture["lecIsConvergence"] is not None else None,
            "lecIsArt": int(lecture["lecIsArt"]) if lecture["lecIsArt"] is not None else None,
            "lecSubName": lecture["lecSubName"] if lecture["lecSubName"] else "값이 비었어요",
            "year": lecture["year"] if lecture["year"] else 0,
            "semester": lecture["semester"] if lecture["semester"] else "값이 비었어요",
            "isChecked": lecture["isChecked"] if lecture["isChecked"] else False,
            "priority": lecture["priority"] if lecture["priority"] else "",
            "userListedLecClassRoom": lecture["userListedLecClassRoom"] if lecture["userListedLecClassRoom"] else "",
            "userListedLecMemo": lecture["userListedLecMemo"] if lecture["userListedLecMemo"] else "",
        })

    return user_listed_lectures


@router.post("/user/data/update_lecture_check_status")
async def update_lecture_check_status(request: Request, update_request: LectureCheckUpdateRequest):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    query = """
    UPDATE userListedLecture
    SET isChecked = ?, priority = ?
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """
    cursor.execute(query, (
        update_request.is_checked,
        update_request.priority,
        user_id,
        update_request.lec_number,
        update_request.year,
        update_request.semester
    ))
    conn.commit()

    return {"detail": "lec check status updated"}


@router.post("/user/data/update_lecture_priority")
async def update_lecture_priority(request: Request, update_request: LecturePriorityUpdateRequest):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not authenticated")

    conn = db_connect()
    cursor = conn.cursor()

    select_query = """
    SELECT priority FROM userListedLecture
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """
    cursor.execute(select_query, (
        user_id,
        update_request.lec_number,
        update_request.year,
        update_request.semester
    ))
    result = cursor.fetchone()

    if result is not None:
        new_priority = update_request.priority

        update_query = """
        UPDATE userListedLecture
        SET priority = ?
        WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
        """
        cursor.execute(update_query, (
            new_priority,
            user_id,
            update_request.lec_number,
            update_request.year,
            update_request.semester
        ))
        conn.commit()

        return {"detail": "lecture priority updated"}
    else:
        raise HTTPException(status_code=404, detail="Lecture not found")


@router.post("/user/data/delete_lecture")
async def delete_lecture(request: Request, delete_request: LectureCheckDeleteRequest):
    user_id = request.cookies.get("user_id")
    print("req delete_lecture")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    print(delete_request.lec_number, delete_request.year, delete_request.semester)

    query = """
    DELETE FROM userListedLecture
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """
    cursor.execute(query, (
        user_id,
        delete_request.lec_number,
        delete_request.year,
        delete_request.semester
    ))
    conn.commit()

    return {"detail": "lecture deleted"}


@router.get("/user/data/total_gpa")
def read_total_gpa(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="no exist user id")

    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT totalGPA FROM user WHERE user_id = ?", (user_id,))
    gpa_row = cursor.fetchone()
    print(f"GPA Query result: {gpa_row}")

    if gpa_row:
        result = {"totalGPA": gpa_row[0] or 0}
    else:
        result = {"totalGPA": 0}

    conn.close()

    return result


@router.post("/user/data/update_lecture_info")
async def update_lecture_info(request: Request, update_request: LectureInfoUpdateRequest):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not authenticated")

    conn = db_connect()
    cursor = conn.cursor()

    select_query = """
    SELECT * FROM userListedLecture
    WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
    """
    cursor.execute(select_query, (
        user_id,
        update_request.lec_number,
        update_request.year,
        update_request.semester
    ))
    result = cursor.fetchone()

    if result is not None:
        update_query = """
        UPDATE userListedLecture
        SET userListedLecClassRoom = ?, userListedLecMemo = ?
        WHERE user_id = ? AND lecNumber = ? AND year = ? AND semester = ?
        """
        cursor.execute(update_query, (
            update_request.classroom,
            update_request.memo,
            user_id,
            update_request.lec_number,
            update_request.year,
            update_request.semester
        ))
        conn.commit()

        return {"detail": "Lecture information updated"}
    else:
        raise HTTPException(status_code=404, detail="Lecture not found")


@router.post("/user/data/complete_lecture")
async def complete_lecture(request: Request, lecture_user_done: LectureUserDone):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not authenticated")

    conn = db_connect()
    cursor = conn.cursor()

    check_query = """
    SELECT COUNT(*) FROM userTakenLecture
    WHERE user_id = ? AND takenLecName = ? AND takenLecClassification = ? AND year = ? AND semester = ?
    """

    cursor.execute(check_query, (user_id, lecture_user_done.takenLecName,
                   lecture_user_done.takenLecClassification, lecture_user_done.year, lecture_user_done.semester))
    result = cursor.fetchone()

    if result[0] > 0:
        raise HTTPException(
            status_code=400, detail="lecture already completed")

    insert_query = """
    INSERT INTO userTakenLecture (user_id, takenLecName, takenLecClassification, takenLecCredit, userCredit, year, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    user_credit = ""

    try:
        cursor.execute(insert_query, (
            user_id,
            lecture_user_done.takenLecName,
            lecture_user_done.takenLecClassification,
            lecture_user_done.takenLecCredit,
            user_credit,
            lecture_user_done.year,
            lecture_user_done.semester
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail="Database error: " + str(e))
    finally:
        conn.close()

    return {"message": "lecture completing updated"}


@router.post("/user/data/user_taken_lectures")
async def user_taken_lectures(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not authenticated")

    conn = db_connect()
    cursor = conn.cursor()

    query = """
    SELECT takenLecName, takenLecClassification, takenLecCredit 
    FROM userTakenLecture 
    WHERE user_id = ? AND userCredit NOT IN ('F', 'NP')
    """
    cursor.execute(query, (user_id,))
    results = cursor.fetchall()

    cursor.close()
    conn.close()

    return {"lectures": [{"takenLecName": row[0], "takenLecClassification": row[1], "takenLecCredit": row[2]} for row in results]}


@router.post("/user/data/uncomplete_lecture")
async def uncomplete_lecture(request: Request):
    data = await request.json()
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User not authenticated")

    takenLecName = data.get("takenLecName")
    takenLecClassification = data.get("takenLecClassification")
    year = data.get("year")
    semester = data.get("semester")

    conn = db_connect()
    cursor = conn.cursor()

    query = """
    DELETE FROM userTakenLecture 
    WHERE user_id = ? AND takenLecName = ? AND takenLecClassification = ? AND year = ? AND semester = ?
    """
    cursor.execute(query, (user_id, takenLecName,
                   takenLecClassification, year, semester))
    conn.commit()

    cursor.close()
    conn.close()

    return {"message": "Lecture uncompleted successfully"}
