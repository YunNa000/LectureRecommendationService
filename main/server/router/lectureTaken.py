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
from model import OCRResponse, OCRRequest, OCRLectureInfo, TakenLectureManaullyUpdate, TakenLectureDelete, userID, TakenLectureUpdate

router = APIRouter()


@router.post("/ocr", response_model=OCRResponse)
async def update_lecture_data_by_ocr(request: OCRRequest):
    conn = db_connect()
    cursor = conn.cursor()
    user_taken_lectures = set()
    splited_ocr_data = []

    try:
        print(request.ocrResults)

        for ocr_text in request.ocrResults:
            words = ocr_text.split()
            filtered_words = [word for word in words if len(word) >= 3]
            splited_ocr_data.extend(filtered_words)

        print("splited ocr data: ", splited_ocr_data)

        for word in splited_ocr_data:
            cursor.execute(
                "SELECT lecName, lecClassification, lecCredit FROM LectureList WHERE lecName LIKE ?", ('%' + word + '%',))
            rows = cursor.fetchall()
            for row in rows:
                lecture_info = OCRLectureInfo(
                    lectureName=row[0],
                    lecClassification=row[1],
                    lecCredit=row[2]
                )
                user_taken_lectures.add(lecture_info)

                # 중복 강의 존재 여부 확인
                cursor.execute(
                    "SELECT COUNT(*) FROM UserTakenLecture WHERE lecName = ? AND Classification = ? AND lecCredit = ? AND user_id = ?",
                    (row[0], row[1], row[2], request.user_id)
                )
                count = cursor.fetchone()[0]

                if count == 0:  # 중복이 없을 경우에만 삽입
                    insert_query = """
                        INSERT INTO UserTakenLecture (lecName, Classification, lecCredit, user_id)
                        VALUES (?, ?, ?, ?)
                    """
                    cursor.execute(insert_query, (
                        row[0],  # lecName
                        row[1],  # Classification
                        row[2],  # lecCredit
                        request.user_id
                    ))

        conn.commit()
        print("done?")

    except Exception as e:
        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

    return OCRResponse(userTakenLectures=list(user_taken_lectures))


@router.post("/user/add_taken_lecture_manually")
async def add_user_taken_lecture_manually(input_data: TakenLectureManaullyUpdate):
    conn = db_connect()
    cursor = conn.cursor()

    insert_query = """
        INSERT INTO UserTakenLecture (lecName, Classification, lecCredit, userCredit, user_id)
        VALUES (?, ?, ?, ?, ?)
    """

    try:
        cursor.execute(insert_query, (
            input_data.lecName,
            input_data.Classification,
            input_data.lecCredit,
            input_data.userCredit,
            input_data.user_id
        ))

        conn.commit()

        return {"message": "successfully added taken lecture"}

    except Exception as e:
        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/delete_taken_lecture")
async def delete_user_taken_lecture(input_data: TakenLectureDelete):
    conn = db_connect()
    cursor = conn.cursor()

    update_query = """
        delete from UserTakenLecture
        where user_id = ? 
            and lecName = ? 
            and Classification = ? 
            and lecCredit = ?
    """

    try:
        cursor.execute(update_query, (
            input_data.user_id,
            input_data.lecName,
            input_data.Classification,
            input_data.lecCredit
        ))

        conn.commit()

        return {"message": "delete taken lecture"}

    except Exception as e:
        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/get_taken_lectures")
async def get_user_taken_lectures(request: userID):
    conn = db_connect()
    cursor = conn.cursor()

    select_query = """
        SELECT lecName, Classification, lecCredit, userCredit, year, semester
        FROM UserTakenLecture
        WHERE user_id = ?
    """

    try:
        cursor.execute(select_query, (request.user_id,))
        lectures = cursor.fetchall()

        lectures_list = []
        for lecture in lectures:
            lectures_list.append({
                "lecName": lecture[0],
                "Classification": lecture[1],
                "lecCredit": lecture[2],
                "userCredit": lecture[3],
                "year": lecture[4],
                "semester": lecture[5]
            })

        return {"taken_lectures": lectures_list}

    except Exception as e:
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.post("/user/update_taken_lecture")
async def update_user_taken_lecture(input_data: TakenLectureUpdate):
    conn = db_connect()
    cursor = conn.cursor()

    print(input_data.userCredit)

    update_query = """
        UPDATE UserTakenLecture
        SET Classification = ?, lecCredit = ?, userCredit = ?
        WHERE lecName = ? AND user_id = ?
    """

    try:
        cursor.execute(update_query, (
            input_data.Classification,
            input_data.lecCredit,
            input_data.userCredit,
            input_data.lecName,
            input_data.user_id
        ))

        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Lecture not found")

        return {"message": "Successfully updated taken lecture"}

    except Exception as e:
        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
