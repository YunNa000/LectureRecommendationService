from typing import List
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import LectureCallResponse, LectureCallInput

router = APIRouter()


def get_user_info(user_id):
    conn = db_connect()
    cursor = conn.cursor()

    try:
        query = """
        SELECT bunBan, userYear, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment
        FROM User
        WHERE user_id = ?
        """

        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result:
            bunBan, userYear, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment = result
            return bunBan, userYear, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment
        else:
            return None

    except Exception as e:
        print(e)
        return None

    finally:
        cursor.close()
        conn.close()


def print_JunGong_n_GyoYang(year: int, semester: str, bunBan: str, lecClassification: str, isPillSu: bool, assignmentAmount: str, gradeAmount: str, teamplayAmount: str, star: float, lecTheme: str, lectureName: str, userYear: int, user_id: str, isForeign: bool, lecCredit: int, lecTimeTable: List[str] | None):
    print(f"lecTimeTable: {lecTimeTable}")
    conn = db_connect()
    cursor = conn.cursor()

    user_taken_query = """
    SELECT lecName
    FROM userTakenLecture
    WHERE user_id = ? AND userCredit IS NOT 'F'
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = {row['lecName']
                          for row in cursor.fetchall()}

    base_query = """
    SELECT ll.lectureID, ll.lecNumber, ll.lecName, ll.lecProfessor, ll.lecCredit, ll.lecTime, ll.lecClassroom, ll.semester, ll.year
    FROM LectureList ll
    JOIN LectureConditions lc ON ll.LectureID = lc.LectureID
    JOIN LectureEverytimeData le ON ll.LectureID = le.LectureID
    WHERE ll.isLecClose IS NULL
    AND (lc.canTakeOnly{userYear}year = 1 OR (lc.canTakeOnly1year IS NULL AND lc.canTakeOnly2year IS NULL AND lc.canTakeOnly3year IS NULL AND lc.canTakeOnly4year IS NULL AND lc.canTakeOnly5year IS NULL))
    AND ll.year = ?
    AND ll.semester = ?
    AND lc.canTakeBunBan LIKE ?
    """

    query_params = [
        year,
        semester,
        f'%{bunBan}%'
    ]

    if isForeign:
        base_query += " AND (lc.canTakeForeignPeople = 1 OR lc.canTakeForeignPeople = 0)"
    else:
        base_query += " AND (lc.canTakeForeignPeople = 2 OR lc.canTakeForeignPeople = 0)"

    if lecClassification == "전공":
        if not isPillSu:
            base_query += " AND ll.lecClassification IN ('전선', '전필')"
        else:
            base_query += " AND ll.lecClassification = '전필'"
    elif lecClassification == "교양":
        if not isPillSu:
            base_query += " AND ll.lecClassification IN ('교선', '교필')"
        else:
            base_query += " AND ll.lecClassification = '교필'"

    if assignmentAmount != "상관없음":
        base_query += " AND le.assignmentAmount >= 70"

    if gradeAmount != "상관없음":
        base_query += " AND le.gradeAmount >= 70"

    if teamplayAmount != "상관없음":
        base_query += " AND le.teamplayAmount >= 70"

    if star != 0:
        base_query += " AND le.star >= ?"
        query_params.append(star)

    if lecClassification == "전공":
        base_query += " AND lc.majorRecogBunban LIKE ?"
        query_params.append(f'%{bunBan}%')

    if lecClassification == "교양" and lecTheme != "":
        base_query += " AND ll.lecTheme LIKE ?"
        query_params.append(f'%{lecTheme}%')

    if lectureName != "":
        base_query += " AND ll.lecName LIKE ?"
        query_params.append(f'%{lectureName}%')

    if lecTimeTable and len(lecTimeTable) > 0:
        time_conditions = []
        for time in lecTimeTable:
            time_conditions.append("ll.lecTime LIKE ?")
            query_params.append(f'%{time}%')

        base_query += f" AND ({' OR '.join(time_conditions)})"

    if lecCredit != 0:
        if lecCredit == 4:
            base_query += " AND ll.lecCredit >= ?"
            query_params.append(lecCredit)
        else:
            base_query += " AND ll.lecCredit = ?"
            query_params.append(lecCredit)

    base_query = base_query.replace("{userYear}", str(userYear))

    cursor.execute(base_query, query_params)
    lectures = cursor.fetchall()
    conn.close()

    response = []
    seen_lecture_ids = set()

    for row in lectures:
        lecture_id = row[0]
        lecture_name = row[2]

        if lecture_id in seen_lecture_ids or lecture_name in user_taken_courses:
            continue

        response.append(LectureCallResponse(
            lectureID=lecture_id,
            lecNumber=row[1],
            lecName=lecture_name,
            lecProfessor=row[3],
            lecCredit=row[4],
            lecTime=row[5],
            lecClassroom=row[6],
            semester=row[7],
            year=row[8],
            moreInfo="",
        ))

        seen_lecture_ids.add(lecture_id)

    return response


def print_Total(year: int, semester: str, bunBan: str, lecClassification: str, isPillSu: bool, assignmentAmount: str, gradeAmount: str, teamplayAmount: str, star: float, lecTheme: str, lectureName: str, userYear: int, user_id: str, isForeign: bool, lecCredit: int, lecTimeTable: list[str] | None):

    conn = db_connect()
    cursor = conn.cursor()

    user_taken_query = """
    SELECT lecName
    FROM userTakenLecture
    WHERE user_id = ? AND userCredit is not 'F'
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = [row['lecName'] for row in cursor.fetchall()]

    base_query = """
    SELECT ll.lectureID, ll.lecNumber, ll.lecName, ll.lecProfessor, ll.lecCredit, ll.lecTime, ll.lecClassroom, ll.lecTheme, ll.lecClassification, lc.canTakeBunBan, lc.majorRecogBunBan, lc.canTakeOnly1year, lc.canTakeOnly2year, lc.canTakeOnly3year, lc.canTakeOnly4year, lc.canTakeOnly5year, lc.canTakeForeignPeople, lc.canTakeMultipleMajor, ll.semester, ll.year
    FROM LectureList ll
    JOIN LectureConditions lc ON ll.LectureID = lc.LectureID
    JOIN LectureEverytimeData le ON ll.LectureID = le.LectureID
    WHERE ll.year = ?
    AND ll.semester = ?
    """

    query_params = [
        year,
        semester,
    ]

    if lectureName != "":
        base_query += " AND ll.lecName LIKE ?"
        query_params.append(f'%{lectureName}%')

    if assignmentAmount != "상관없음":
        base_query += " AND le.assignmentAmount >= 70"

    if gradeAmount != "상관없음":
        base_query += " AND le.gradeAmount >= 70"

    if teamplayAmount != "상관없음":
        base_query += " AND le.teamplayAmount >= 70"

    if star != 0:
        base_query += " AND le.star >= ?"
        query_params.append(star)

    if lecTimeTable and len(lecTimeTable) > 0:
        time_conditions = []
        for time in lecTimeTable:
            time_conditions.append("ll.lecTime LIKE ?")
            query_params.append(f'%{time}%')
        base_query += f" AND ({' OR '.join(time_conditions)})"

    print(lecCredit)
    if lecCredit != 0:
        if lecCredit == 4:
            base_query += " AND ll.lecCredit >= ?"
            query_params.append(lecCredit)
        else:
            base_query += " AND ll.lecCredit = ?"
            query_params.append(lecCredit)
    cursor.execute(base_query, query_params)

    lectures = cursor.fetchall()
    conn.close()

    response = []
    seen_lecture_ids = set()

    major_mapping = {
        "E1": "전자공학과",
        "E5": "전자통신공학과",
        "E7": "전자융합공학",
        "J1": "전기공학과",
        "J3": "전자재료공학과",
        "T1": "반도체시스템공학부",
        "C1": "컴퓨터정보공학부",
        "C4": "소프트웨어학부",
        "C7": "🔥최 강 정 융🔥",
        "J5": "로봇학부",
        "A2": "건축공학과",
        "K1": "화학공학과",
        "K3": "환경공학과",
        "A1": "건축학과",
        "N1": "수학과",
        "N2": "전자바이오물리학과",
        "N4": "화학과",
        "P1": "스포츠융합학과",
        "test2": "정보콘텐츠학과(사이버정보보안학과)",
        "R1": "국어국문학과",
        "R2": "영어산업학과",
        "M1": "미디어커뮤니케이션학부",
        "R3": "산업심리학과",
        "R4": "동북아문화산업학부",
        "S1": "행정학과",
        "L1": "법학부",
        "S3": "국제학부",
        "test1": "자산관리학과(부동산법무학과)",
        "B1": "경영학부",
        "B5": "국제통상학부",
        "V1": "금융부동산법무학과",
        "V2": "게임콘텐츠학과",
        "V3": "스마트전기전자학과",
        "V4": "스포츠상담재활학과",
    }

    for row in lectures:
        lecture_id = row[0]
        if lecture_id in seen_lecture_ids:
            continue

        more_info = ""

        if row[2] in user_taken_courses:
            more_info += "이미 수강한 강의에요. "

        can_take_bunban = [b.strip().lower() for b in row[9].split(',')]
        bunBan_lower = bunBan.lower()

        if bunBan_lower not in can_take_bunban:
            more_info += "분반에 속하지 않아요. "

        major_recog_bunban = row[10].split(',')
        for major in major_recog_bunban:
            major = major.strip()
            if major in major_mapping:
                more_info += f"{major_mapping[major]} 전공 과목. "

        can_take_foreign_people = row[16]
        if (isForeign == 0) and (can_take_foreign_people == "1"):
            more_info += "유학생만 들을 수 있어요. "
        elif isForeign == 1 and can_take_foreign_people == "2":
            more_info += "유학생은 들을 수 없어요. "

        response.append(LectureCallResponse(
            lectureID=lecture_id,
            lecNumber=row[1],
            lecName=row[2],
            lecProfessor=row[3],
            lecCredit=row[4],
            lecTime=row[5],
            lecClassroom=row[6],
            moreInfo=more_info.strip(),
            semester=row[18],
            year=row[19],
        ))

        seen_lecture_ids.add(lecture_id)

    return response


@router.post("/lectures/", response_model=List[LectureCallResponse])
async def get_lectures(input_data: LectureCallInput):

    user_info = get_user_info(input_data.user_id)

    if user_info:
        bunBan, userYear, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment = user_info
    else:
        return {"error": "error fetch user data"}

    user_id = input_data.user_id
    year = input_data.year
    semester = input_data.semester
    lecClassification = input_data.lecClassification
    isPillSu = input_data.isPillSu
    assignmentAmount = input_data.assignmentAmount
    gradeAmount = input_data.gradeAmount
    teamplayAmount = input_data.teamplayAmount
    star = input_data.star
    lecTheme = input_data.lecTheme
    lectureName = input_data.lectureName
    lecCredit = input_data.lecCredit
    lecTimeTable = input_data.lecTimeTable

    if lecClassification == "전체":
        response = print_Total(
            year=year, semester=semester, bunBan=bunBan, lecClassification=lecClassification, isPillSu=isPillSu, assignmentAmount=assignmentAmount, gradeAmount=gradeAmount, teamplayAmount=teamplayAmount, star=star, lecTheme=lecTheme, lectureName=lectureName, userYear=userYear, user_id=user_id, isForeign=isForeign, lecCredit=lecCredit, lecTimeTable=lecTimeTable)
    else:
        response = print_JunGong_n_GyoYang(
            year=year, semester=semester, bunBan=bunBan, lecClassification=lecClassification, isPillSu=isPillSu, assignmentAmount=assignmentAmount, gradeAmount=gradeAmount, teamplayAmount=teamplayAmount, star=star, lecTheme=lecTheme, lectureName=lectureName, userYear=userYear, user_id=user_id, isForeign=isForeign, lecCredit=lecCredit, lecTimeTable=lecTimeTable)

    return response
