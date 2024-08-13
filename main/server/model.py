from pydantic import BaseModel
from typing import List, Union, Dict, Optional


class LoggedInResponse(BaseModel):
    message: str
    user_id: str
    userName: str


class NotLoggedInResponse(BaseModel):
    message: str


class LectureCallResponse(BaseModel):
    lectureID: int
    lecNumber: str
    lecName: str
    lecProfessor: str
    lecCredit: int
    lecTime: str
    lecClassroom: str
    moreInfo: str
    semester: str
    year: int


class LectureCallInput(BaseModel):
    user_id: str
    lecClassification: str
    lecTheme: str
    teamplayAmount: str
    gradeAmount: str
    assignmentAmount: str
    star: float
    userWantTime: str
    isPillSu: bool
    lectureName: str
    year: int
    semester: str


class LectureSelect(BaseModel):
    user_id: str
    year: int
    semester: str
    lecNumber: str


class userID(BaseModel):
    user_id: str
