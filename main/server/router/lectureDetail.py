# from fastapi import FastAPI, HTTPException, APIRouter
# from db import db_connect

# router = APIRouter()

# @router.get("/lecture/{year}/{semester}/{lecture_number}")
# async def get_lecture(year: int, semester: str, lecture_number: str):
#     query = """
#     SELECT lecName FROM LectureList WHERE lecNumber = ? AND year = ? AND semester = ?
#     """
    
#     conn = db_connect()
#     cursor = conn.cursor()
#     cursor.execute(query, (lecture_number, year, semester))
#     row = cursor.fetchone()
#     conn.close()

#     if row is None:
#         raise HTTPException(status_code=404, detail="Lecture not found")

#     return {"lecName": row[0]}  # S


from fastapi import FastAPI, HTTPException, APIRouter
from db import db_connect
from pydantic import BaseModel

router = APIRouter()

class LectureDetail(BaseModel):
    lectureID: int
    year: int | None
    semester: str | None
    lecNumber: str
    lecName: str | None
    lecProfessor: str | None
    lecClassification: str | None
    lecTheme: str | None
    lecCredit: int | None
    lecTime: str | None
    lecWeekTime: int | None
    lecClassroom: str | None
    isLecClose: bool | None
    takenPeople1yearsAgo: int | str| None
    takenPeople2yearsAgo: int | str| None
    takenPeople3yearsAgo: int | str| None
    ForeignLanguage: str | None
    percentageOfOnline: int | None
    isPNP: bool | None
    isEngineering: bool | None
    isTBL: bool | None
    isPBL: bool | None
    isSeminar: bool | None
    isSmall: bool | None
    isConvergence: bool | None
    isTeamTeaching: bool | None
    isFocus: bool | None
    isExperimentDesign: bool | None
    isELearning: bool | None
    isArt: bool | None
    representCompetency: str | None
    learningGoalNmethod: str | None
    Overview: str | None
    evaluationRatio: str | None
    mainBook: str | None
    scheduleNcontent: str | None
    everytimeURL: str | None
    star: float | None
    assignmentAmount: float | None
    teamPlayAmount: float | None
    gradeAmount: float | None
    reviewSummary: str | None
    checkAttend: str | None
    testNum: str | None
    

@router.get("/lecture/{year}/{semester}/{lecture_number}", response_model=LectureDetail)
async def get_lecture(year: int, semester: str, lecture_number: str):
    query = """
    SELECT * FROM LectureDetailView 
    WHERE lecNumber = ? AND year = ? AND semester = ?
    """
    
    conn = db_connect()
    cursor = conn.cursor()
    cursor.execute(query, (lecture_number, year, semester))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Lecture not found")

    # Convert the row tuple to a dictionary
    columns = [column[0] for column in cursor.description]
    lecture_dict = dict(zip(columns, row))

    return LectureDetail(**lecture_dict)

