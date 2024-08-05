from fastapi import APIRouter, Request, FastAPI, Depends, HTTPException, Cookie
from model import PersonalInformation, LecturesUpdateRequest, UserListedLectureTotalCredit
from typing import List
from db import db_connect
import sqlite3

router = APIRouter()


@router.get("/user/data", response_model=List[PersonalInformation])
async def get_user_data(request: Request):
    user_id = request.cookies.get("user_id")
    print(f"|-- /user/data | user_id: {user_id}")
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

        cursor.execute(
            "SELECT lecNumber FROM userListedLecture WHERE user_id = ?", (user_dict['user_id'],))
        lecNumbers = cursor.fetchall()
        user_dict['selectedLecNumbers'] = [lecNumber[0]
                                           for lecNumber in lecNumbers]

        cursor.execute(
            # userCredit을 함께 가져오기 위한 쿼리 수정
            "SELECT takenLecName, takenLecClassification, takenLecCredit, userCredit FROM userTakenLecture WHERE user_id = ?",
            (user_dict['user_id'],)
        )
        takenLectures = cursor.fetchall()
        user_dict['userTakenLectures'] = [
            # userCredit을 포함하도록 수정
            {
                "lectureName": lecture[0],
                "lecClassification": lecture[1],
                "lecCredit": lecture[2],
                "userCredit": lecture[3]  # userCredit 추가
            }
            for lecture in takenLectures
        ]

        user_dict['userCredit'] = user_dict.get('userCredit')

        print("|-- /user/data | user_dict:",
              user_dict['selectedLecNumbers'], user_dict['userTakenLectures'])

        user_info = PersonalInformation(
            user_id=user_dict['user_id'],
            userHakbun=user_dict['userHakbun'],
            userIsForeign=user_dict['userIsForeign'],
            userBunban=user_dict['userBunban'],
            userYear=user_dict['userYear'],
            userMajor=user_dict['userMajor'],
            userIsMultipleMajor=user_dict['userIsMultipleMajor'],
            userWhatMultipleMajor=user_dict['userWhatMultipleMajor'],
            userTakenLecture=user_dict['userTakenLecture'],
            userName=user_dict['userName'],
            selectedLecNumbers=user_dict['selectedLecNumbers'],
            userTakenLectures=user_dict['userTakenLectures'],
            userCredit=user_dict['userCredit']
        )

        users.append(user_info)
        print("|-- /user/data | users:", users)

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
            INSERT INTO userListedLecture (user_id, lecNumber) 
            VALUES (?, ?)
            ''', (user_id, lecNumber))
        except sqlite3.IntegrityError:
            continue

    for lecNumber in lectures_to_remove:
        cursor.execute('''
        DELETE FROM userListedLecture WHERE user_id = ? AND lecNumber = ?
        ''', (user_id, lecNumber))

    conn.commit()
    conn.close()

    return {"message": "updated"}


@router.get("/user/data/listed_lecture_total_credit", response_model=UserListedLectureTotalCredit)
async def get_user_listed_lecture_total_credit(request: Request):
    user_id = request.cookies.get("user_id")
    print(f"|-- /user/data/listed_lecture_total_credit | user_id: {user_id}")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    cursor.execute("""
SELECT u.user_id, SUM(l.lecCredit) AS totalCredits FROM userListedLecture u JOIN LectureTable l ON u.lecNumber = l.lecNumber WHERE u.user_id = ? GROUP BY u.user_id;""", (user_id,))

    result = cursor.fetchone()
    conn.close()

    if result:
        user_id, total_credits = result
        print(result)
        return {"total_credits": total_credits}
    else:
        raise HTTPException(status_code=404, detail="user not found")
