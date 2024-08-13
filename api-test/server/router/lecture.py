from typing import List
from fastapi import HTTPException, HTTPException, APIRouter

from db import db_connect
from model import LectureRequest, LectureRequestManagement


router = APIRouter()


@router.post("/lectures", response_model=List[dict])
async def read_lectures(request: LectureRequestManagement):
    user_id = request.userId
    if not user_id:
        raise HTTPException(status_code=400, detail="not exist")

    conn = db_connect()
    cursor = conn.cursor()

    user_taken_query = """
    SELECT lecName
    FROM userTakenLecture
    WHERE user_id = ? AND userCredit is not 'F'
    """
    cursor.execute(user_taken_query, (user_id,))
    user_taken_courses = [row['lecName'] for row in cursor.fetchall()]
    print("user taken courses", user_taken_courses)

    latest_year_semester_query = """
    SELECT year, semester
    FROM LectureList
    ORDER BY year DESC, semester DESC
    LIMIT 1
    """
    cursor.execute(latest_year_semester_query)
    latest_year_semester = cursor.fetchone()
    if not latest_year_semester:
        raise HTTPException(status_code=404, detail="db에 강의 정보가 전혀 없다는 건가요?")

    latest_year, latest_semester = latest_year_semester['year'], latest_year_semester['semester']

    print(latest_year, latest_semester)

    classification = request.lecClassification
    user_grade = request.userYear

    print(classification)
    print(user_grade)

    # query_template = """
    # SELECT lecName, lecNumber, lecProfessor
    # FROM LectureList ll
    # JOIN LectureConditions lc ON ll.lectureID = lc.lectureID
    # WHERE {bunban_condition}
    # AND ll.lecClassification = ?
    # AND ll.year = ?
    # AND ll.semester = ?
    # AND (
    #     lc.canTakeOnly{user_grade}year = 1 OR
    #     (lc.canTakeOnly1year is NULL AND lc.canTakeOnly2year is NULL AND lc.canTakeOnly3year is NULL AND lc.canTakeOnly4year is NULL AND lc.canTakeOnly5year is NULL)
    # )
    # """

    # if classification in ["전필", "전선"]:
    #     bunban_condition = "lc.majorRecogBunBan LIKE ?"
    # else:
    #     bunban_condition = "lc.canTakeBunBan LIKE ?"

    # query = query_template.format(
    #     bunban_condition=bunban_condition, user_grade=user_grade)

    # parameters = [f"%{request.bunBan}%",
    #               classification, latest_year, latest_semester, request.userYear]

    # print(parameters)

    # cursor.execute(query, parameters)

    test_query = """
    select lecName, lecNumber, year, semester
    from LectureList
    where lecClassification = "전필"
    """

    cursor.execute(test_query)
    lectures = cursor.fetchall()

    conn.close()

    # print(lectures)

    # if not lectures:
    #     raise HTTPException(status_code=404, detail="해당 조건에 맞는 강의가 없어요..😢")

    # return_data = []
    # for lecture in lectures:
    #     lecName = lecture["lecName"] if lecture["lecName"] else "값이 비었어요"
    #     lecNumber = lecture["lecNumber"] if lecture["lecNumber"] else "값이 비었어요"
    #     lecProfessor = lecture["lecProfessor"] if lecture["lecProfessor"] else "값이 비었어요"
    #     lecCredit = lecture["lecCredit"] if lecture["lecCredit"] else "값이 비었어요"
    #     lecTime = lecture["lecTime"] if lecture["lecTime"] else "값이 비었어요"

    #     return_data.append({
    #         "lecName": lecName,
    #         "lecNumber": lecNumber,
    #         "lecProfessor": lecProfessor,
    #         "lecCredit": lecCredit,
    #         "lecTime": lecTime,
    #     })

    return lectures
    # return return_data
