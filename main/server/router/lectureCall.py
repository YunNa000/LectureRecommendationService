from typing import List
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import LectureCallResponse, LectureCallInput, LectureRecommendationCallInput, LectureRecommendCallResponse
from typing import List, Optional
from sentence_transformers import SentenceTransformer, util
import numpy as np
import os
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.embeddings import CacheBackedEmbeddings
from langchain_openai import ChatOpenAI
from langchain.schema import Document
from langchain.schema.runnable import RunnableLambda, RunnablePassthrough
from langchain.storage import LocalFileStore
from langchain_community.vectorstores import FAISS
from langchain.embeddings import CacheBackedEmbeddings
from langchain_community.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv
import json
load_dotenv()

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# model = SentenceTransformer('intfloat/multilingual-e5-large')
model = SentenceTransformer('intfloat/multilingual-e5-small')

llm = ChatOpenAI(
    temperature=0.1,
    streaming=True,
    model="gpt-4o-mini",
    openai_api_key=OPENAI_API_KEY)


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


def check_multi_major(bunban):
    major_mapping = {
        "E1": "전자공학과",
        "E5": "전자통신공학과",
        "E7": "전자융합공학",
        "J1": "전기공학과",
        "J3": "전자재료공학과",
        "T1": "반도체시스템공학부",
        "C1": "컴퓨터정보공학부",
        "C4": "소프트웨어학부",
        "C7": "정보융합학부",
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

    if bunban in major_mapping:
        return major_mapping[bunban]
    else:
        return None


def print_JunGong_n_GyoYang(year: int, semester: str, bunBan: str, lecClassification: str, isPillSu: bool, assignmentAmount: str, gradeAmount: str, teamplayAmount: str, star: float, lecTheme: str, lectureName: str, userYear: int, user_id: str, isForeign: bool, lecCredit: int, lecTimeTable: Optional[List[str]], whatMultipleMajor: str, whatMultipleMajorDepartment: str):
    conn = db_connect()
    cursor = conn.cursor()

    user_taken_query = """
    SELECT lecName
    FROM userTakenLecture
    WHERE user_id = ? AND userCredit IS NOT 'F'
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = {row['lecName'] for row in cursor.fetchall()}

    base_query = """
    SELECT ll.lectureID, ll.lecNumber, ll.lecName, ll.lecProfessor, ll.lecCredit, ll.lecTime, ll.lecClassroom, ll.semester, ll.year, lc.majorRecogBunBan, lc.requirementClass, ll.lecTheme, ll.lecClassification, ll.lecWeekTime, le.star, le.assignmentAmount, le.teamPlayAmount, le.gradeAmount, le.reviewSummary
    FROM LectureList ll
    JOIN LectureConditions lc ON ll.LectureID = lc.LectureID
    JOIN LectureEverytimeData le ON ll.LectureID = le.LectureID
    JOIN LectureDetailData ld ON ll.LectureID = ld.LectureID
    WHERE (ll.isLecClose IS NULL OR ll.isLecClose = 0)
    AND (lc.canTakeOnly{userYear}year = 1
    OR (((lc.canTakeOnly1year IS NULL or lc.canTakeOnly1year is 0)
    AND (lc.canTakeOnly2year IS NULL or lc.canTakeOnly2year IS 0)
    AND (lc.canTakeOnly3year IS NULL or lc.canTakeOnly3year IS 0)
    AND (lc.canTakeOnly4year IS NULL or lc.canTakeOnly4year IS 0)
    AND (lc.canTakeOnly5year IS NULL  or lc.canTakeOnly5year IS 0))))
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

    user_plused_bunban = None

    if lecClassification == "전공":
        if whatMultipleMajor in ("복수전공", "부전공"):
            user_plused_bunban = check_multiple_major_bunban(
                department=whatMultipleMajorDepartment)

        print("user_plused_bunban:", user_plused_bunban)
        print("user_plused_bunban type:", type(user_plused_bunban))

        if user_plused_bunban is not None:
            base_query += " AND (lc.majorRecogBunban LIKE ? OR lc.majorRecogBunban LIKE ?)"
            query_params.append(f'%{bunBan}%')
            query_params.append(f'%{user_plused_bunban}%')
        else:
            base_query += " AND lc.majorRecogBunban LIKE ?"
            query_params.append(f'%{bunBan}%')

    if lecClassification == "교양" and lecTheme != "":
        base_query += " AND ll.lecTheme LIKE ?"
        query_params.append(f'%{lecTheme}%')

    if lectureName != "":
        base_query += " AND (ll.lecName LIKE ? OR ll.lecProfessor LIKE ? OR ll.lecNumber LIKE ?)"
        query_params.append(f'%{lectureName}%')
        query_params.append(f'%{lectureName}%')
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

    base_query += " AND (lc.requirementClass IS NULL OR lc.requirementClass = '' OR EXISTS (SELECT 1 FROM userTakenLecture utl WHERE utl.lecName LIKE '%' || lc.requirementClass || '%'))"

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

        more_info = ""

        if user_plused_bunban and user_plused_bunban in row[9]:
            multi_major = check_multi_major(user_plused_bunban)
            more_info += f"{multi_major} 전공 과목 "

        try:
            lec_week_time = str(int(row[13]))
        except (ValueError, TypeError):
            lec_week_time = '0'

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
            moreInfo=more_info,
            lecTheme=row[11],
            lecClassification=row[12],
            lecWeekTime=lec_week_time,
            star=row[14],
            assignmentAmount=row[15],
            teamPlayAmount=row[16],
            gradeAmount=row[17],
            reviewSummary=row[18]
        ))
        seen_lecture_ids.add(lecture_id)

    response.sort(
        key=lambda x: x.star if x.star is not None else 3, reverse=True)

    return response


def print_Total(year: int, semester: str, bunBan: str, lecClassification: str, isPillSu: bool, assignmentAmount: str, gradeAmount: str, teamplayAmount: str, star: float, lecTheme: str, lectureName: str, userYear: int, user_id: str, isForeign: bool, lecCredit: int, lecTimeTable: Optional[List[str]], whatMultipleMajor: str, whatMultipleMajorDepartment: str):

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
    SELECT ll.lectureID, ll.lecNumber, ll.lecName, ll.lecProfessor, ll.lecCredit, ll.lecTime, ll.lecClassroom, ll.lecTheme, ll.lecClassification, lc.canTakeBunBan, lc.majorRecogBunBan, lc.canTakeOnly1year, lc.canTakeOnly2year, lc.canTakeOnly3year, lc.canTakeOnly4year, lc.canTakeOnly5year, lc.canTakeForeignPeople, lc.canTakeMultipleMajor, ll.semester, ll.year, ll.lecTheme, ll.lecClassification, ll.lecWeekTime, le.star, le.assignmentAmount, le.teamPlayAmount, le.gradeAmount, le.reviewSummary
    FROM LectureList ll
    JOIN LectureConditions lc ON ll.LectureID = lc.LectureID
    JOIN LectureEverytimeData le ON ll.LectureID = le.LectureID
    JOIN LectureDetailData ld ON ll.LectureID = ld.LectureID
    WHERE ll.year = ?
    AND ll.semester = ?
    """

    query_params = [
        year,
        semester,
    ]

    if lectureName != "":
        base_query += " AND (ll.lecName LIKE ? OR ll.lecProfessor LIKE ? OR ll.lecNumber LIKE ?)"
        query_params.append(f'%{lectureName}%')
        query_params.append(f'%{lectureName}%')
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
        "C7": "정보융합학부",
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
            more_info += "수강한 강의예요. "

        can_take_bunban = [b.strip().lower() for b in row[9].split(',')]
        bunBan_lower = bunBan.lower()

        user_plused_bunban = None
        user_plused_bunban_lower = None

        if lecClassification == "전공":
            if whatMultipleMajor in ("복수전공", "부전공"):
                user_plused_bunban = check_multiple_major_bunban(
                    department=whatMultipleMajorDepartment)

                if user_plused_bunban is not None:
                    user_plused_bunban_lower = user_plused_bunban.lower()
                else:
                    user_plused_bunban_lower = None

        if user_plused_bunban_lower is not None:
            if bunBan_lower not in can_take_bunban and bunBan_lower not in user_plused_bunban_lower:
                more_info += "분반에 속하지 않아요. "
        else:
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

        try:
            lec_week_time = str(int(row[22]))
        except (ValueError, TypeError):
            lec_week_time = '0'

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
            lecTheme=row[20],
            lecClassification=row[21],
            lecWeekTime=lec_week_time,
            star=row[23],
            assignmentAmount=row[24],
            teamPlayAmount=row[25],
            gradeAmount=row[26],
            reviewSummary=row[27]
        ))

        seen_lecture_ids.add(lecture_id)

    response.sort(key=lambda x: x.star, reverse=True)

    return response


def print_user_can_take(year: int, semester: str, bunBan: str, userYear: int, user_id: str, isForeign: bool):
    conn = db_connect()
    cursor = conn.cursor()

    user_taken_query = """
    SELECT lecName
    FROM userTakenLecture
    WHERE user_id = ? AND userCredit IS NOT 'F'
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = {row['lecName'] for row in cursor.fetchall()}

    base_query = f"""
    SELECT ll.lectureID, ll.lecNumber, ll.lecName, ll.lecProfessor, ll.lecCredit, ll.lecTime, ll.lecClassroom, ll.semester, ll.year, lc.majorRecogBunBan, lc.requirementClass, ll.lecTheme, ll.lecClassification, ll.lecWeekTime, le.star, le.assignmentAmount, le.teamPlayAmount, le.gradeAmount, le.reviewSummary, ld.OverviewEmbedding, ld.EverytimeEmbedding, ld.Overview
    FROM LectureList ll
    JOIN LectureConditions lc ON ll.LectureID = lc.LectureID
    JOIN LectureEverytimeData le ON ll.LectureID = le.LectureID
    JOIN LectureDetailData ld ON ll.LectureID = ld.LectureID
    WHERE (ll.isLecClose IS NULL OR ll.isLecClose = 0)
    AND (lc.canTakeOnly{userYear}year = 1
    OR (((lc.canTakeOnly1year IS NULL or lc.canTakeOnly1year is 0)
    AND (lc.canTakeOnly2year IS NULL or lc.canTakeOnly2year IS 0)
    AND (lc.canTakeOnly3year IS NULL or lc.canTakeOnly3year IS 0)
    AND (lc.canTakeOnly4year IS NULL or lc.canTakeOnly4year IS 0)
    AND (lc.canTakeOnly5year IS NULL  or lc.canTakeOnly5year IS 0))))
    AND ll.year = ?
    AND ll.semester = ?
    """

    query_params = [
        year,
        semester,
    ]

    if isForeign:
        base_query += " AND (lc.canTakeForeignPeople = 1 OR lc.canTakeForeignPeople = 0)"
    else:
        base_query += " AND (lc.canTakeForeignPeople = 2 OR lc.canTakeForeignPeople = 0)"

    user_plused_bunban = None

    base_query += " AND (lc.requirementClass IS NULL OR lc.requirementClass = '' OR EXISTS (SELECT 1 FROM userTakenLecture utl WHERE utl.lecName LIKE '%' || lc.requirementClass || '%'))"

    base_query = base_query.replace("{userYear}", str(userYear))

    cursor.execute(base_query, query_params)
    lectures = cursor.fetchall()
    conn.close()

    can_take = []
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
        "C7": "정보융합학부",
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
        lecture_name = row[2]

        if lecture_id in seen_lecture_ids or lecture_name in user_taken_courses:
            continue

        more_info = ""

        major_recog_bunban = row[9].split(',')
        for major in major_recog_bunban:
            major = major.strip()
            if major in major_mapping:
                more_info += f"{major_mapping[major]} "
        if more_info != "":
            more_info += "전공 과목."

        try:
            lec_week_time = str(int(row[13]))
        except (ValueError, TypeError):
            lec_week_time = '0'

        can_take.append(LectureRecommendCallResponse(
            lectureID=lecture_id,
            lecNumber=row[1],
            lecName=lecture_name,
            lecProfessor=row[3],
            lecCredit=row[4],
            lecTime=row[5],
            lecClassroom=row[6],
            semester=row[7],
            year=row[8],
            moreInfo=more_info,
            lecTheme=row[11],
            lecClassification=row[12],
            lecWeekTime=lec_week_time,
            star=row[14],
            assignmentAmount=row[15],
            teamPlayAmount=row[16],
            gradeAmount=row[17],
            reviewSummary=row[18],
            OverviewEmbedding=row[19],
            EverytimeEmbedding=row[20],
            Overview=row[21]
        ))
        seen_lecture_ids.add(lecture_id)

    return can_take


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
            year=year, semester=semester, bunBan=bunBan, lecClassification=lecClassification, isPillSu=isPillSu, assignmentAmount=assignmentAmount, gradeAmount=gradeAmount, teamplayAmount=teamplayAmount, star=star, lecTheme=lecTheme, lectureName=lectureName, userYear=userYear, user_id=user_id, isForeign=isForeign, lecCredit=lecCredit, lecTimeTable=lecTimeTable, whatMultipleMajor=whatMultipleMajor, whatMultipleMajorDepartment=whatMultipleMajorDepartment)
    else:
        response = print_JunGong_n_GyoYang(
            year=year, semester=semester, bunBan=bunBan, lecClassification=lecClassification, isPillSu=isPillSu, assignmentAmount=assignmentAmount, gradeAmount=gradeAmount, teamplayAmount=teamplayAmount, star=star, lecTheme=lecTheme, lectureName=lectureName, userYear=userYear, user_id=user_id, isForeign=isForeign, lecCredit=lecCredit, lecTimeTable=lecTimeTable, whatMultipleMajor=whatMultipleMajor, whatMultipleMajorDepartment=whatMultipleMajorDepartment)

    return response

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            당신은 광운대학교의 강의를 추천하는 챗봇입니다. 유저가 찾는 강의와, 강의 정보가 주어졌을 때, 해당 강의가 유저가 찾는 강의인지 판단하여 yes 또는 no로만 답하세요. yes 혹은 no를 제외한 그 외의 답은 절대 하지 마세요.
            """,
        ),
        ("human", "{question}"),
    ]
)


@router.post("/lectures/recommendation", response_model=List[LectureRecommendCallResponse])
async def get_lectures(input_data: LectureRecommendationCallInput):
    user_info = get_user_info(input_data.user_id)

    if user_info:
        bunBan, userYear, isForeign, isMultipleMajor, whatMultipleMajor, whatMultipleMajorDepartment = user_info
    else:
        return {"error": "error fetch user data"}

    user_id = input_data.user_id
    year = input_data.year
    semester = input_data.semester
    userPrefer = input_data.userPrefer

    can_take = print_user_can_take(
        year=year, semester=semester, bunBan=bunBan, isForeign=isForeign, userYear=userYear, user_id=user_id)

    user_embedding = model.encode(userPrefer)

    data = []
    for row in can_take:
        lecture_id = row.lectureID
        overview_embedding = row.OverviewEmbedding
        everytime_embedding = row.EverytimeEmbedding

        if overview_embedding is not None and everytime_embedding is not None:
            overview_embeddings = np.frombuffer(
                overview_embedding, dtype=np.float32)
            everytime_embeddings = np.frombuffer(
                everytime_embedding, dtype=np.float32)

            combined_embeddings = (
                0.5 * overview_embeddings) + (0.5 * everytime_embeddings)
            data.append((lecture_id, combined_embeddings))

    cosine_scores = []
    for lecture_id, embeddings in data:
        score = util.pytorch_cos_sim(user_embedding, embeddings)
        cosine_scores.append((lecture_id, score.item()))

    cosine_scores.sort(key=lambda x: x[1], reverse=True)

    print("cosine_scores:", cosine_scores[:10])

    top_results = []
    return_num = 10
    for lecture_id, score in cosine_scores[:return_num]:
        lecture_info = next(
            (row for row in can_take if row.lectureID == lecture_id), None)

        if lecture_info:

            chain = (
                {
                    "question": RunnablePassthrough(),
                }
                | prompt
                | llm
            )
            question = f"""
강의명: {lecture_info.lecName}
강의 개요: {lecture_info.Overview}
강의 리뷰 요약: {lecture_info.reviewSummary}

유저가 찾는 강의: {userPrefer}
            """

            result = chain.invoke(question)
            print(lecture_info.lecName, result.content)

            if result.content == "yes":
                top_results.append(LectureCallResponse(
                    lectureID=lecture_info.lectureID,
                    lecNumber=lecture_info.lecNumber,
                    lecName=lecture_info.lecName,
                    lecProfessor=lecture_info.lecProfessor,
                    lecCredit=lecture_info.lecCredit,
                    lecTime=lecture_info.lecTime,
                    lecClassroom=lecture_info.lecClassroom,
                    moreInfo=lecture_info.moreInfo,
                    semester=lecture_info.semester,
                    year=lecture_info.year,
                    lecClassification=lecture_info.lecClassification,
                    lecTheme=lecture_info.lecTheme,
                    lecWeekTime=lecture_info.lecWeekTime,
                    star=lecture_info.star,
                    assignmentAmount=lecture_info.assignmentAmount,
                    teamPlayAmount=lecture_info.teamPlayAmount,
                    gradeAmount=lecture_info.gradeAmount,
                    reviewSummary=lecture_info.reviewSummary
                ))

    return top_results
