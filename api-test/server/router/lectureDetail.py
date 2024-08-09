from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from typing import Optional
from db import db_connect

router = APIRouter()

class Lecture(BaseModel):
    lecNumber: str
    year: Optional[int] = None
    semester: Optional[str] = None
    lecUrl: Optional[str] = None
    lecClassification: Optional[str] = None
    lecClassName: Optional[str] = None
    lecSubName: Optional[str] = None
    lecProfessor: Optional[str] = None
    lecStars: Optional[float] = None
    lecAssignment: Optional[float] = None
    lecTeamplay: Optional[float] = None
    lecGrade: Optional[float] = None
    lecSummaryReview: Optional[str] = None
    lecAttend: Optional[str] = None
    lecTestNum: Optional[str] = None
    lecLastYear1PeopleNum: Optional[int] = None
    lecLastYear2PeopleNum: Optional[int] = None
    lecLastYear3PeopleNum: Optional[int] = None
    lecIsPNP: Optional[bool] = None
    lecIsEngeneering: Optional[bool] = None
    lecRequirementClass: Optional[str] = None
    lecForeignLanguageRatio: Optional[str] = None
    lecException: Optional[str] = None
    lecTakeOnly1Year: Optional[int] = None
    lecTakeOnly2Year: Optional[int] = None
    lecTakeOnly3Year: Optional[int] = None
    lecTakeOnly4Year: Optional[int] = None
    lecTakeOnly5Year: Optional[int] = None
    lecCredit: Optional[int] = None
    lecWeekHours: Optional[int] = None
    lecForeignPeopleCanTake: Optional[bool] = None
    lecCanTakeMultipleMajor: Optional[bool] = None
    lecTakeOnlyAthletics: Optional[bool] = None
    lecTakeOnlyChambit: Optional[bool] = None
    lecLinkedMajorDifficulty: Optional[str] = None
    lecMoreInfo: Optional[str] = None
    lecCanTakeBunban: Optional[str] = None
    lecMajorRecogBunban: Optional[str] = None
    lecTime: Optional[str] = None
    lecEvaluateRatio: Optional[str] = None
    lecOverview: Optional[str] = None
    lecIsEng: Optional[bool] = None
    lecIsCn: Optional[bool] = None
    lecIsJp: Optional[bool] = None
    lecIsTBL: Optional[bool] = None
    lecIsPBL: Optional[bool] = None
    lecIsSeminar: Optional[bool] = None
    lecIsSmall: Optional[bool] = None
    lecIsConvergence: Optional[bool] = None
    lecIsTeamTeach: Optional[bool] = None
    lecIsWorkStudyCombine: Optional[bool] = None
    lecIseLearning: Optional[bool] = None
    lecIsExperimentDesign: Optional[bool] = None
    lecIsFocus: Optional[bool] = None
    lecIsDistance100: Optional[bool] = None
    lecIsDistance50: Optional[bool] = None
    lecIsFace: Optional[bool] = None
    lcIsOnline: Optional[bool] = None
    lecIsRecorded: Optional[bool] = None
    lecIsDoExperiment: Optional[bool] = None
    lecIsDiscussion: Optional[bool] = None
    lecIsArt: Optional[bool] = None
    lecClassRoom: Optional[str] = None

def convert_to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes', 'y')
    return None

def convert_row_to_dict(row):
    result = dict(row)
    bool_fields = ['lecIsPNP', 'lecIsEngeneering', 'lecForeignPeopleCanTake', 
                   'lecCanTakeMultipleMajor', 'lecTakeOnlyAthletics', 'lecTakeOnlyChambit',
                   'lecIsEng', 'lecIsCn', 'lecIsJp', 'lecIsTBL', 'lecIsPBL', 'lecIsSeminar',
                   'lecIsSmall', 'lecIsConvergence', 'lecIsTeamTeach', 'lecIsWorkStudyCombine',
                   'lecIseLearning', 'lecIsExperimentDesign', 'lecIsFocus', 'lecIsDistance100',
                   'lecIsDistance50', 'lecIsFace', 'lcIsOnline', 'lecIsRecorded',
                   'lecIsDoExperiment', 'lecIsDiscussion', 'lecIsArt']
    
    for field in bool_fields:
        if field in result:
            result[field] = convert_to_bool(result[field])
    
    return result

@router.get("/lecture/{lecture_number}")
async def get_lecture(lecture_number: str):
    query = """
    SELECT * FROM LectureTable WHERE lecNumber = ?
    """
    
    conn = db_connect()
    cursor = conn.cursor()
    cursor.execute(query, (lecture_number,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Lecture not found")

    converted_data = convert_row_to_dict(row)
    return Lecture(**converted_data)