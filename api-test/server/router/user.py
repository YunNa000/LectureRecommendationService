from fastapi import APIRouter, Request, FastAPI, Depends, HTTPException, Cookie
from model import PersonalInformation, LecturesUpdateRequest, LectureListed
from typing import List
from db import db_connect
import sqlite3

router = APIRouter()


@router.get("/user/data", response_model=List[PersonalInformation])
async def get_user_data(request: Request):
    user_id = request.cookies.get("user_id")
    # print(f"|-- /user/data | user_id: {user_id}")
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

        # print("|-- /user/data | user_dict:",
        #       user_dict['selectedLecNumbers'], user_dict['userTakenLectures'])

        user_info = PersonalInformation(
            user_id=user_dict['user_id'],
            userHakbun=user_dict['userHakbun'] if user_dict['userHakbun'] else 0,
            userIsForeign=user_dict['userIsForeign'] if user_dict['userIsForeign'] else False,
            userBunban=user_dict['userBunban'] if user_dict['userBunban'] else "",
            userYear=user_dict['userYear'] if user_dict['userYear'] else "",
            userMajor=user_dict['userMajor'] if user_dict['userMajor'] else "_",
            userIsMultipleMajor=user_dict['userIsMultipleMajor'] if user_dict['userIsMultipleMajor'] is not None else False,
            userWhatMultipleMajor=user_dict['userWhatMultipleMajor'] if user_dict['userWhatMultipleMajor'] else None,
            userTakenLecture=user_dict['userTakenLecture'] if user_dict['userTakenLecture'] else None,
            userName=user_dict['userName'],
            selectedLecNumbers=user_dict['selectedLecNumbers'] if user_dict['selectedLecNumbers'] else [
            ],
            userTakenLectures=user_dict['userTakenLectures'] if user_dict['userTakenLectures'] else [
            ],
            userCredit=user_dict['userCredit'] if user_dict['userCredit'] else None
        )

        users.append(user_info)
        # print("|-- /user/data | users:", users)

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
            SELECT year, semester FROM LectureTable WHERE lecNumber = ?
            ''', (lecNumber,))
            lecture_info = cursor.fetchone()
            if lecture_info:
                year, semester = lecture_info
                cursor.execute('''
                INSERT INTO userListedLecture (user_id, lecNumber, year, semester) 
                VALUES (?, ?, ?, ?)
                ''', (user_id, lecNumber, year, semester))
        except sqlite3.IntegrityError:
            continue

    for lecNumber in lectures_to_remove:
        cursor.execute('''
        DELETE FROM userListedLecture WHERE user_id = ? AND lecNumber = ?
        ''', (user_id, lecNumber))

    conn.commit()
    conn.close()

    return {"message": "updated"}


@router.get("/user/data/listed_lectures_data", response_model=List[LectureListed])
async def listed_lectures_data(request: Request):
    user_id = request.cookies.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    query = """
    SELECT lt.lecClassName, lt.lecNumber, lt.lecProfessor, lt.lecTime, lt.lecClassification, lt.lecStars,
           lt.lecAssignment, lt.lecTeamplay, lt.lecGrade, lt.lecIsPNP, lt.lecCredit, lt.lecIsTBL, lt.lecIsPBL,
           lt.lecIsSeminar, lt.lecIsSmall, lt.lecIsConvergence, lt.lecIsArt, lt.lecSubName, lt.year, lt.semester. ull.isChecked
    FROM userListedLecture ull
    JOIN LectureTable lt ON ull.lecNumber = lt.lecNumber
    WHERE ull.user_id = ?
    """
    cursor.execute(query, (user_id,))
    lectures = cursor.fetchall()

    if not lectures:
        raise HTTPException(status_code=404, detail="선택한 강의가 없어요.")

    user_listed_lectures = []
    for lecture in lectures:
        user_listed_lectures.append({
            "lecClassName": lecture["lecClassName"] if lecture["lecClassName"] else "값이 비었어요",
            "lecNumber": lecture["lecNumber"] if lecture["lecNumber"] else "값이 비었어요",
            "lecProfessor": lecture["lecProfessor"] if lecture["lecProfessor"] else "값이 비었어요",
            "lecTime": lecture["lecTime"] if lecture["lecTime"] else "값이 비었어요",
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
        })

    return user_listed_lectures
