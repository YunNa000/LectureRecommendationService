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
from model import OCRResponse, OCRRequest

router = APIRouter()


@router.post("/user/update/ocr", response_model=OCRResponse)
async def process_text(request: OCRRequest):
    text = request.text
    words = text.split()

    conn = db_connect()
    cursor = conn.cursor()

    user_taken_lectures = []
    lecture_names_set = set()

    for word in words:
        if len(word) > 3:
            cursor.execute(
                "SELECT lecName, lecClassification, lecCredit FROM LectureList WHERE lecName LIKE ?", ('%' + word + '%',))
            rows = cursor.fetchall()
            for row in rows:
                lecture_name = row[0]  # lecName
                lec_classification = row[1]  # lecClassification
                lec_credit = row[2]  # lecCredit
                if lecture_name not in lecture_names_set:
                    lecture_info = {
                        'lectureName': lecture_name,
                        'lecClassification': lec_classification,
                        'lecCredit': str(lec_credit)
                    }
                    user_taken_lectures.append(lecture_info)
                    lecture_names_set.add(lecture_name)

    conn.close()
    return OCRResponse(userTakenLectures=user_taken_lectures)
