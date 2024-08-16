from typing import List, Dict
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import UserBasicInfo, userID

router = APIRouter()


@router.post("/user/update")
async def update_user_info(input_data: UserBasicInfo):
    conn = db_connect()
    cursor = conn.cursor()

    update_query = """
        UPDATE User
        SET hakBun = ?,
            bunBan = ?,
            userYear = ?,
            userMajor = ?,
            userName = ?,
            isForeign = ?,
            isMultipleMajor = ?,
            whatMultipleMajor = ?,
            whatMultipleMajorDepartment = ?
        WHERE user_id = ?
    """

    try:

        cursor.execute(update_query, (
            input_data.hakBun,
            input_data.bunBan,
            input_data.userYear,
            input_data.userMajor,
            input_data.username,
            input_data.isForeign,
            input_data.isMultipleMajor,
            input_data.whatMultipleMajor,
            input_data.whatMultipleMajorDepartment,
            input_data.user_id
        ))

        conn.commit()

        return {"message": "update user info"}

    except Exception as e:

        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=434, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/data", response_model=UserBasicInfo)
async def return_basic_user_data(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    query = """
        SELECT hakBun, bunBan, userYear, userMajor, userName, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment
        FROM User
        WHERE user_id = ?
    """

    try:
        cursor.execute(query, (request.user_id,))
        user_data = cursor.fetchone()

        if user_data is None:
            raise HTTPException(status_code=434, detail="user not exist")

        return UserBasicInfo(
            user_id=request.user_id,
            hakBun=user_data[0],
            bunBan=user_data[1],
            userYear=user_data[2],
            userMajor=user_data[3],
            username=user_data[4],
            isForeign=user_data[5],
            isMultipleMajor=user_data[6],
            whatMultipleMajor=user_data[7],
            whatMultipleMajorDepartment=user_data[8],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/data/totalgpa")
async def return_user_total_gpa(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    query = """
        SELECT totalGPA
        FROM User
        WHERE user_id = ?
    """

    try:
        cursor.execute(query, (request.user_id,))
        user_data = cursor.fetchone()

        if user_data is None:
            raise HTTPException(status_code=434, detail="user not exist")

        return user_data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/data/graduation_conditions")
async def return_user_graduation_conditions(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    user_id = request.user_id

    cursor.execute(
        "SELECT SUM(lecCredit) FROM UserTakenLecture WHERE user_id = ?", (user_id,))
    user_taken_total_credit = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT SUM(lecCredit) 
        FROM UserTakenLecture 
        WHERE user_id = ? AND Classification IN ('전선', '전필')
    """, (user_id,))
    user_taken_major_credit = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT SUM(lecCredit) 
        FROM UserTakenLecture 
        WHERE user_id = ? AND Classification IN ('교필', '교선')
    """, (user_id,))
    user_taken_gyoyang_credit = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT SUM(lecCredit) 
        FROM UserTakenLecture 
        WHERE user_id = ? AND Classification NOT IN ('전선', '전필', '교필', '교선')
    """, (user_id,))
    user_taken_other_credit = cursor.fetchone()[0] or 0

    # User 테이블에서 hakbun 가져오기
    cursor.execute(
        "SELECT hakbun, bunBan, isMultipleMajor FROM User WHERE user_id = ?", (user_id,))
    user_info = cursor.fetchone()

    if user_info is None:
        return {"error": "User not found"}

    hakbun, bunBan, is_multiple_major = user_info

    # hakbun의 첫 4글자로 year 설정
    year = str(hakbun)[:4]

    print(bunBan, year)

    cursor.execute("""
        SELECT gyoPillCredit, gyoGyunCredit, oneMajorCredit, doubleMajorCredit, requirementTotalCredit, gyoGyunTheme, gyoPillLecName 
        FROM GraduationRequirements 
        WHERE bunBan LIKE ? AND year = ?
    """, (f'%{bunBan}%', year))

    requirements = cursor.fetchone()

    if requirements is None:
        return {"error": "requirements is None"}

    user_require_gyoPillCredit, user_require_gyoGyunCredit, user_require_oneMajorCredit, user_require_doubleMajorCredit, user_require_requirementTotalCredit, user_require_gyoGyunTheme, user_require_gyoPillLecName = requirements

    user_require_major_credit = user_require_doubleMajorCredit if is_multiple_major else user_require_oneMajorCredit

    required_themes = user_require_gyoGyunTheme.split(',')
    cursor.execute(
        "SELECT DISTINCT lecTheme FROM UserTakenLecture WHERE user_id = ?", (user_id,))
    taken_themes = cursor.fetchall()
    taken_theme_set = {theme[0]
                       for theme in taken_themes if theme[0] is not None}

    user_taken_require_gyoGyunTheme = []
    user_not_taken_require_gyoGyunTheme = []

    for theme in required_themes:
        if theme in taken_theme_set:
            user_taken_require_gyoGyunTheme.append(theme)
        else:
            user_not_taken_require_gyoGyunTheme.append(theme)

    required_lectures = user_require_gyoPillLecName.split(',')
    cursor.execute(
        "SELECT DISTINCT lecName FROM UserTakenLecture WHERE user_id = ?", (user_id,))
    taken_lectures = cursor.fetchall()
    taken_lecture_set = {lecture[0]
                         for lecture in taken_lectures if lecture[0] is not None}

    user_taken_require_gyoPillName = []
    user_not_taken_require_gyoPillName = []

    for lecture in required_lectures:
        if lecture in taken_lecture_set:
            user_taken_require_gyoPillName.append(lecture)
        else:
            user_not_taken_require_gyoPillName.append(lecture)

    print(f"user: {user_id} | 전체 학점: {user_taken_total_credit}/{user_require_requirementTotalCredit} | 전공 학점: {user_taken_major_credit}/{user_require_major_credit} | 교양 학점: {user_taken_gyoyang_credit}/{user_require_gyoPillCredit + user_require_gyoGyunCredit} | 기타 학점: {user_taken_other_credit}")
    print(f"수강한 교양균형: {user_taken_require_gyoGyunTheme}")
    print(f"미수강한 교양균형: {user_not_taken_require_gyoGyunTheme}")
    print(f"수강한 교필: {user_taken_require_gyoPillName}")
    print(f"미수강한 교필: {user_not_taken_require_gyoPillName}")

    return {
        "taken_total_credit": user_taken_total_credit,
        "user_require_requirementTotalCredit": user_require_requirementTotalCredit,
        "taken_major_credit": user_taken_major_credit,
        "user_require_major_credit": user_require_major_credit,
        "taken_gyoyang_credit": user_taken_gyoyang_credit,
        "user_require_gyoPillCredit": user_require_gyoPillCredit,
        "user_require_gyoGyunCredit": user_require_gyoGyunCredit,
        "taken_other_credit": user_taken_other_credit,
        "taken_gyoGyunTheme": user_taken_require_gyoGyunTheme,
        "not_taken_gyoGyunTheme": user_not_taken_require_gyoGyunTheme,
        "taken_gyoPillName": user_taken_require_gyoPillName,
        "not_taken_gyoPillName": user_not_taken_require_gyoPillName,
    }
