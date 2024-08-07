from typing import List, Optional
from fastapi import HTTPException, APIRouter, Cookie
from db import db_connect
from model import LectureRequest
from fastapi import APIRouter, Request, FastAPI, Depends, HTTPException, Cookie
from model import PersonalInformation, LecturesUpdateRequest, LectureListed
from typing import List
from db import db_connect
import sqlite3

router = APIRouter()


@router.post("/lectures/total", response_model=List[dict])
async def read_lectures_all(request: LectureRequest):
    user_id = request.userId
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    # 유저가 수강한 강의 가져오기
    user_taken_query = """
    SELECT takenLecName
    FROM userTakenLecture
    WHERE user_id = ?
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = [row['takenLecName'] for row in cursor.fetchall()]

    # 모든 강의 가져오기
    query = """
    SELECT lecClassName, lecNumber, lecProfessor, lecCredit, lecTime, lecSubName, lecAssignment, lecTeamplay, lecGrade, lecSummaryReview, lecStars, lecClassification, lecIsPNP, lecIsEngeneering, lecTakeOnly1Year, lecTakeOnly2Year, lecTakeOnly3Year, lecTakeOnly4Year, lecTakeOnly5Year, lecIsArt, lecIsDoExperiment, lecIsOnline, lecIsRecorded, lecCanTakeBunban, lecMajorRecogBunban
    FROM LectureTable
    """

    parameters = []
    conditions = []

    if request.lecSubName:
        conditions.append("lecSubName = ?")
        parameters.append(request.lecSubName)
    if request.year:
        conditions.append("year = ?")
        parameters.append(request.year)
    if request.semester:
        conditions.append("semester = ?")
        parameters.append(request.semester)
    if request.isUserForeign is not None:
        conditions.append("lecForeignPeopleCanTake = 1")
    if request.lecClassName:
        lecClassName = request.lecClassName.replace(" ", "")
        conditions.append("lecClassName LIKE ?")
        parameters.append(f"%{lecClassName}%")
    if request.isUserMultiple is not None:
        conditions.append("lecCanTakeMultipleMajor = 1")
    if request.lecStars:
        conditions.append("lecStars >= ?")
        parameters.append(str(request.lecStars))
    if request.lecAssignment is not None:
        conditions.append("lecAssignment >= 65")
    if request.lecTeamplay is not None:
        conditions.append("lecTeamplay >= 65")
    if request.lecGrade is not None:
        conditions.append("lecGrade >= 65")
    if request.lecIsPNP is not None:
        conditions.append("lecIsPNP = 1")
    if request.lecCredit is not None:
        conditions.append("lecCredit = ?")
        parameters.append(str(request.lecCredit))
    if request.lecIsTBL is not None:
        conditions.append("lecIsTBL = 1")
    if request.lecIsPBL is not None:
        conditions.append("lecIsPBL = 1")
    if request.lecIsSeminar is not None:
        conditions.append("lecIsSeminar = 1")
    if request.lecIsSmall is not None:
        conditions.append("lecIsSmall = 1")
    if request.lecIsConvergence is not None:
        conditions.append("lecIsConvergence = 1")
    if request.lecIsNoneFace is not None:
        conditions.append("(lecIseLearning = 1 OR lecIsDistance100 = 1)")
    if request.lecIsArt is not None:
        conditions.append("lecIsArt = 1")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    cursor.execute(query, parameters)
    lectures = cursor.fetchall()
    conn.close()

    if not lectures:
        raise HTTPException(status_code=404, detail="해당 조건에 맞는 강의가 없어요..😢")

    return_data = []
    for lecture in lectures:
        lecClassName = lecture["lecClassName"] if lecture["lecClassName"] else "값이 비었어요"
        lecNumber = lecture["lecNumber"] if lecture["lecNumber"] else "값이 비었어요"
        lecProfessor = lecture["lecProfessor"] if lecture["lecProfessor"] else "값이 비었어요"
        lecCredit = lecture["lecCredit"] if lecture["lecCredit"] else "값이 비었어요"
        lecTime = lecture["lecTime"] if lecture["lecTime"] else "값이 비었어요"
        lecSubName = lecture["lecSubName"] if lecture["lecSubName"] else "값이 비었어요"
        lecAssignment = lecture["lecAssignment"] if lecture["lecAssignment"] else "값이 비었어요"
        lecTeamplay = lecture["lecTeamplay"] if lecture["lecTeamplay"] else "값이 비었어요"
        lecGrade = lecture["lecGrade"] if lecture["lecGrade"] else "값이 비었어요"
        lecSummaryReview = lecture["lecSummaryReview"] if lecture["lecSummaryReview"] else "값이 비었어요"
        lecStars = lecture["lecStars"] if lecture["lecStars"] else "값이 비었어요"
        lecClassification = lecture["lecClassification"] if lecture["lecClassification"] else "값이 비었어요"
        lecMajorRecogBunban = lecture["lecMajorRecogBunban"] if lecture["lecMajorRecogBunban"] else None

        user_grade = request.userGrade

        lecture_data = {
            "lecClassName": lecClassName,
            "lecNumber": lecNumber,
            "lecProfessor": lecProfessor,
            "lecCredit": lecCredit,
            "lecTime": lecTime,
            "lecSubName": lecSubName,
            "lecAssignment": lecAssignment,
            "lecTeamplay": lecTeamplay,
            "lecGrade": lecGrade,
            "lecSummaryReview": lecSummaryReview,
            "lecStars": lecStars,
            "lecClassification": lecClassification,
        }

        if lecSubName in user_taken_courses:
            lecture_data["userCanNotTake"] = "userAlreadyTaken"
        elif request.userBunban.lower() not in lecture["lecCanTakeBunban"].lower():
            lecture_data["userCanNotTake"] = "userCanNotTake"
        elif not (lecture[f"lecTakeOnly{user_grade}Year"] == 1 or all(lecture[f"lecTakeOnly{grade}Year"] is None for grade in range(1, 6))):
            lecture_data["userCanNotTake"] = "userCanNotTake"

        lecMajorRecogBunban = lecture["lecMajorRecogBunban"]
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

        if lecMajorRecogBunban:
            for key, value in major_mapping.items():
                if key in lecMajorRecogBunban:
                    lecture_data["MajorRecog"] = value
                    break

        return_data.append(lecture_data)

    return return_data
