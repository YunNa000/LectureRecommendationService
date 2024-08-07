from typing import List, Dict, Optional, Union
from fastapi import FastAPI, HTTPException, Request, Depends, HTTPException, Cookie, APIRouter
from pydantic import BaseModel
import sqlite3
import uvicorn
import os
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.responses import RedirectResponse
import httpx
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta
from db import db_connect
from model import LectureRequest


router = APIRouter()


@router.post("/lectures", response_model=List[dict])
async def read_lectures(request: LectureRequest):
    user_id = request.userId
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    user_taken_query = """
    SELECT takenLecName
    FROM userTakenLecture
    WHERE user_id = ? AND userCredit is not 'F'
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = [row['takenLecName'] for row in cursor.fetchall()]
    print(user_taken_courses)

    latest_year_semester_query = """
    SELECT year, semester
    FROM LectureTable
    ORDER BY year DESC, semester DESC
    LIMIT 1
    """
    cursor.execute(latest_year_semester_query)
    latest_year_semester = cursor.fetchone()
    if not latest_year_semester:
        raise HTTPException(status_code=404, detail="강의 데이터가 없습니다.")

    latest_year, latest_semester = latest_year_semester['year'], latest_year_semester['semester']

    classification = request.lecClassification
    user_grade = request.userGrade

    # 공통 쿼리 템플릿
    query_template = """
    SELECT lecClassName, lecNumber, lecProfessor, lecCredit, lecTime, lecSubName, lecAssignment, lecTeamplay, lecGrade, lecSummaryReview, lecStars, lecClassification, lecIsPNP, lecIsEngeneering, lecTakeOnly1Year, lecTakeOnly2Year, lecTakeOnly3Year, lecTakeOnly4Year, lecTakeOnly5Year, lecIsArt, lecIsDoExperiment, lecIsOnline, lecIsRecorded
    FROM LectureTable
    WHERE {bunban_condition}
    AND lecClassification = ?
    AND year = ?
    AND semester = ?
    AND (
        lecTakeOnly{user_grade}Year = 1 OR 
        (lecTakeOnly1Year is NULL AND lecTakeOnly2Year is NULL AND lecTakeOnly3Year is NULL AND lecTakeOnly4Year is NULL)
    )
    """

    if classification in ["전필", "전선"]:
        bunban_condition = "lecMajorRecogBunban LIKE ?"
    else:
        bunban_condition = "lecCanTakeBunban LIKE ?"

    query = query_template.format(
        bunban_condition=bunban_condition, user_grade=user_grade)

    parameters = [f"%{request.userBunban}%",
                  classification, latest_year, latest_semester]
    conditions = []

    # 아래 조건들에 따라서 쿼리문이 추가됨
    if user_taken_courses:
        placeholders = ', '.join(['?'] * len(user_taken_courses))
        conditions.append(f"lecClassName NOT IN ({placeholders})")
        parameters.extend(user_taken_courses)
    if request.lecClassName:
        lecClassName = request.lecClassName.replace(" ", "")
        print(lecClassName)
        conditions.append("lecClassName LIKE ?")
        parameters.append(f"%{lecClassName}%")
    if request.lecSubName:
        conditions.append("lecSubName LIKE ?")
        parameters.append(f"%{request.lecSubName}%")
    if request.isUserForeign is not None:
        conditions.append("lecForeignPeopleCanTake = 1")
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
        query += " AND " + " AND ".join(conditions)

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

        return_data.append({
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
            "lecClassification": lecClassification
        })

    return return_data
