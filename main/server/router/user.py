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


def check_multiple_major_bunban(department):
    major_mapping = {
        "전자공학과": "E1",
        "전자통신공학과": "E5",
        "전자융합공학": "E7",
        "전기공학과": "J1",
        "전자재료공학과": "J3",
        "반도체시스템공학부": "T1",
        "컴퓨터정보공학부": "C1",
        "소프트웨어학부": "C4",
        "정보융합학부": "C7",
        "로봇학부": "J5",
        "건축공학과": "A2",
        "화학공학과": "K1",
        "환경공학과": "K3",
        "건축학과": "A1",
        "수학과": "N1",
        "전자바이오물리학과": "N2",
        "화학과": "N4",
        "스포츠융합학과": "P1",
        "정보콘텐츠학과(사이버정보보안학과)": "test2",
        "국어국문학과": "R1",
        "영어산업학과": "R2",
        "미디어커뮤니케이션학부": "M1",
        "산업심리학과": "R3",
        "동북아문화산업학부": "R4",
        "행정학과": "S1",
        "법학부": "L1",
        "국제학부": "S3",
        "자산관리학과(부동산법무학과)": "test1",
        "경영학부": "B1",
        "국제통상학부": "B5",
        "금융부동산법무학과": "V1",
        "게임콘텐츠학과": "V2",
        "스마트전기전자학과": "V3",
        "스포츠상담재활학과": "V4",
    }

    if department in major_mapping:
        return major_mapping[department]
    else:
        return None


@router.post("/user/data/graduation_conditions")
async def return_user_graduation_conditions(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    user_id = request.user_id

    # 유저의 총 학점 계산
    cursor.execute(
        "SELECT SUM(lecCredit) FROM UserTakenLecture WHERE user_id = ?", (user_id,))
    user_taken_total_credit = cursor.fetchone()[0] or 0

    cursor.execute(
        "SELECT hakbun, bunBan, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment FROM User WHERE user_id = ?", (user_id,))
    user_info = cursor.fetchone()

    if user_info is None:
        return {"error": "User not found"}

    hakbun, bunBan, is_multiple_major, what_multiple_major, what_multiple_major_department = user_info

    user_plused_bunban = None
    if what_multiple_major_department != "":
        user_plused_bunban = check_multiple_major_bunban(
            what_multiple_major_department)

    user_taken_multiple_major_credit = 0
    user_taken_major_credit = 0

    cursor.execute("""
        SELECT lecCredit, majorRecogBunBan 
        FROM UserTakenLecture 
        WHERE user_id = ? AND Classification IN ('전선', '전필')
    """, (user_id,))
    taken_lectures = cursor.fetchall()

    for lecCredit, majorRecogBunBan in taken_lectures:
        if majorRecogBunBan is None:
            user_taken_major_credit += lecCredit
        elif bunBan in majorRecogBunBan:
            user_taken_major_credit += lecCredit
        elif user_plused_bunban and user_plused_bunban in majorRecogBunBan:
            user_taken_multiple_major_credit += lecCredit

    # 나머지 학점 계산
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

    year = str(hakbun)[:4]

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

    multiple_major_credit = 0

    if what_multiple_major == "복수전공":
        cursor.execute("""
            SELECT doubleMajorCredit FROM GraduationRequirements 
            WHERE department = ? and year = ?
        """, (what_multiple_major_department, year))
        multiple_major_credit = cursor.fetchone()[0] or 0

    elif what_multiple_major == "부전공":
        cursor.execute("""
            SELECT minorCredit FROM GraduationRequirements 
            WHERE department = ? and year = ?
        """, (what_multiple_major_department, year))
        multiple_major_credit = cursor.fetchone()[0] or 0

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

    print(f"user: {user_id} | 전체 학점: {user_taken_total_credit}/{user_require_requirementTotalCredit} | 전공 학점: {user_taken_major_credit}/{user_require_major_credit} | {what_multiple_major_department} {what_multiple_major} 학점: {user_taken_multiple_major_credit}/{multiple_major_credit}| 교양 학점: {user_taken_gyoyang_credit}/{user_require_gyoPillCredit + user_require_gyoGyunCredit} | 기타 학점: {user_taken_other_credit}")
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
        "user_taken_multiple_major_credit": user_taken_multiple_major_credit,
        "multiple_major_credit": multiple_major_credit,
        "what_multiple_major_department": what_multiple_major_department,
        "what_multiple_major": what_multiple_major,
    }
