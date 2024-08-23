from typing import List
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import AdminLectureSearch, AdminLectureEdit, AdminEditTime
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


@router.post("/admin")
async def admin(request: AdminLectureSearch):
    conn = db_connect()
    cursor = conn.cursor()

    query = """
    SELECT
        l.lectureID, l.year, l.semester, l.lecNumber, l.lecName, l.lecProfessor,
        l.lecClassification, l.lecTheme, l.lecCredit, l.lecTime, l.lecWeekTime,
        l.lecClassroom, l.isLecClose,
        d.takenPeople1yearsAgo, d.takenPeople2yearsAgo, d.takenPeople3yearsAgo,
        d.ForeignLanguage, d.percentageOfOnline, d.isPNP, d.isEngineering,
        d.isTBL, d.isPBL, d.isSeminar, d.isSmall, d.isConvergence,
        d.isTeamTeaching, d.isFocus, d.isExperimentDesign, d.isELearning,
        d.isArt, d.representCompetency, d.learningGoalNmethod,
        d.Overview, d.evaluationRatio,
        d.mainBook, d.scheduleNcontent,
        c.canTakeBunBan, c.majorRecogBunBan, c.canTakeOnly1year,
        c.canTakeOnly2year, c.canTakeOnly3year, c.canTakeOnly4year,
        c.canTakeOnly5year, c.canTakeForeignPeople, c.canTakeMultipleMajor,
        c.canTakeOnlyAthlete, c.canTakeOnlyChambit,
        c.requirementClass, c.lecLinkedMajorDifficulty
    FROM
        LectureList l
    LEFT JOIN
        LectureDetailData d ON l.lectureID = d.lectureID
    LEFT JOIN
        LectureConditions c ON l.lectureID = c.lectureID
    WHERE
        l.year = ? AND
        l.semester = ? AND
        (l.lecNumber = ? OR l.lecName = ? OR l.lecProfessor = ?)
    """

    params = (request.year, request.semester, request.search_term,
              request.search_term, request.search_term)

    print(request.year, request.semester, request.search_term,
          request.search_term, request.search_term)

    try:
        cursor.execute(query, params)
        results = cursor.fetchall()

        if not results:
            raise HTTPException(status_code=404, detail="if not results")

        lectures = []
        unique_lecture_ids = set()

        for row in results:
            lecture_id = row[0]
            if lecture_id not in unique_lecture_ids:
                unique_lecture_ids.add(lecture_id)
                lecture = {
                    "lectureID": lecture_id,
                    "year": row[1],
                    "semester": row[2],
                    "lecNumber": row[3],
                    "lecName": row[4],
                    "lecProfessor": row[5],
                    "lecClassification": row[6],
                    "lecTheme": row[7],
                    "lecCredit": row[8],
                    "lecTime": row[9],
                    "lecWeekTime": row[10],
                    "lecClassroom": row[11],
                    "isLecClose": row[12],
                    "takenPeople1yearsAgo": row[13],
                    "takenPeople2yearsAgo": row[14],
                    "takenPeople3yearsAgo": row[15],
                    "ForeignLanguage": row[16],
                    "percentageOfOnline": row[17],
                    "isPNP": row[18],
                    "isEngineering": row[19],
                    "isTBL": row[20],
                    "isPBL": row[21],
                    "isSeminar": row[22],
                    "isSmall": row[23],
                    "isConvergence": row[24],
                    "isTeamTeaching": row[25],
                    "isFocus": row[26],
                    "isExperimentDesign": row[27],
                    "isELearning": row[28],
                    "isArt": row[29],
                    "representCompetency": row[30],
                    "learningGoalNmethod": row[31],
                    "Overview": row[32],
                    "evaluationRatio": row[33],
                    "mainBook": row[34],
                    "scheduleNcontent": row[35],
                    "canTakeBunBan": row[36],
                    "majorRecogBunBan": row[37],
                    "canTakeOnly1year": row[38],
                    "canTakeOnly2year": row[39],
                    "canTakeOnly3year": row[40],
                    "canTakeOnly4year": row[41],
                    "canTakeOnly5year": row[42],
                    "canTakeForeignPeople": row[43],
                    "canTakeMultipleMajor": row[44],
                    "canTakeOnlyAthlete": row[45],
                    "canTakeOnlyChambit": row[46],
                    "requirementClass": row[47],
                    "lecLinkedMajorDifficulty": row[48],
                }
                lectures.append(lecture)

        return {"lectures": lectures}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.put("/admin/edit")
async def edit_lecture(lecture_id: int, request: AdminLectureEdit):
    conn = db_connect()
    cursor = conn.cursor()
    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_password != request.password:
        return "32자리랜덤숫자+영어+기호"

    print(request.year)
    print(request.semester)

    update_queries = {
        "LectureList": {
            "fields": [],
            "params": []
        },
        "LectureDetailData": {
            "fields": [],
            "params": []
        },
        "LectureConditions": {
            "fields": [],
            "params": []
        },
    }
    update_queries_user_lised_lecture = {
        "UserListedLecture": {
            "fields": [],
            "params": []
        }
    }

    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)
    print(request.lecNumber)

    if request.lecNumber is not None:
        update_queries["LectureList"]["fields"].append("lecNumber = ?")
        update_queries["LectureList"]["params"].append(request.lecNumber)
    if request.lecName is not None:
        update_queries["LectureList"]["fields"].append("lecName = ?")
        update_queries["LectureList"]["params"].append(request.lecName)
    if request.lecProfessor is not None:
        update_queries["LectureList"]["fields"].append("lecProfessor = ?")
        update_queries["LectureList"]["params"].append(request.lecProfessor)
    if request.lecClassification is not None:
        update_queries["LectureList"]["fields"].append("lecClassification = ?")
        update_queries["LectureList"]["params"].append(
            request.lecClassification)
    if request.lecTheme is not None:
        update_queries["LectureList"]["fields"].append("lecTheme = ?")
        update_queries["LectureList"]["params"].append(request.lecTheme)
    if request.lecCredit is not None:
        update_queries["LectureList"]["fields"].append("lecCredit = ?")
        update_queries["LectureList"]["params"].append(request.lecCredit)
    if request.year is not None:
        update_queries["LectureList"]["fields"].append("year = ?")
        update_queries["LectureList"]["params"].append(request.year)
    if request.semester is not None:
        update_queries["LectureList"]["fields"].append("semester = ?")
        update_queries["LectureList"]["params"].append(request.semester)
    if request.lecTime is not None:
        update_queries["LectureList"]["fields"].append("lecTime = ?")
        update_queries["LectureList"]["params"].append(request.lecTime)
    if request.lecWeekTime is not None:
        update_queries["LectureList"]["fields"].append("lecWeekTime = ?")
        update_queries["LectureList"]["params"].append(request.lecWeekTime)
    if request.lecClassroom is not None:
        update_queries["LectureList"]["fields"].append("lecClassroom = ?")
        update_queries["LectureList"]["params"].append(request.lecClassroom)
    if request.isLecClose is not None:
        update_queries["LectureList"]["fields"].append("isLecClose = ?")
        update_queries["LectureList"]["params"].append(request.isLecClose)
        update_queries_user_lised_lecture["UserListedLecture"]["fields"].append(
            "isLecClose = ?")
        update_queries_user_lised_lecture["UserListedLecture"]["params"].append(
            request.isLecClose)

    print("====================", request.lecNumber, "===============")

    if update_queries_user_lised_lecture["UserListedLecture"]["fields"]:
        print("=================================\n=================================\n=================================\n=================================\n")
        user_lecture_update_query = f"""
        UPDATE UserListedLecture
        SET {', '.join(update_queries_user_lised_lecture["UserListedLecture"]["fields"])}
        WHERE lecNumber = ? AND year = ? AND semester = ?
        """
        update_queries_user_lised_lecture["UserListedLecture"]["params"].extend(
            [request.lecNumber, request.year, request.semester])
        cursor.execute(user_lecture_update_query,
                       update_queries_user_lised_lecture["UserListedLecture"]["params"])
        print(user_lecture_update_query)
        print(update_queries_user_lised_lecture["UserListedLecture"]["params"])
        print("================")

    if request.takenPeople1yearsAgo is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "takenPeople1yearsAgo = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.takenPeople1yearsAgo)
    if request.takenPeople2yearsAgo is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "takenPeople2yearsAgo = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.takenPeople2yearsAgo)
    if request.takenPeople3yearsAgo is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "takenPeople3yearsAgo = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.takenPeople3yearsAgo)
    if request.ForeignLanguage is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "ForeignLanguage = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.ForeignLanguage)
    if request.percentageOfOnline is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "percentageOfOnline = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.percentageOfOnline)
    if request.isPNP is not None:
        update_queries["LectureDetailData"]["fields"].append("isPNP = ?")
        update_queries["LectureDetailData"]["params"].append(request.isPNP)
    if request.isEngineering is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "isEngineering = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.isEngineering)
    if request.isTBL is not None:
        update_queries["LectureDetailData"]["fields"].append("isTBL = ?")
        update_queries["LectureDetailData"]["params"].append(request.isTBL)
    if request.isPBL is not None:
        update_queries["LectureDetailData"]["fields"].append("isPBL = ?")
        update_queries["LectureDetailData"]["params"].append(request.isPBL)
    if request.isSeminar is not None:
        update_queries["LectureDetailData"]["fields"].append("isSeminar = ?")
        update_queries["LectureDetailData"]["params"].append(request.isSeminar)
    if request.isSmall is not None:
        update_queries["LectureDetailData"]["fields"].append("isSmall = ?")
        update_queries["LectureDetailData"]["params"].append(request.isSmall)
    if request.isConvergence is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "isConvergence = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.isConvergence)
    if request.isTeamTeaching is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "isTeamTeaching = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.isTeamTeaching)
    if request.isFocus is not None:
        update_queries["LectureDetailData"]["fields"].append("isFocus = ?")
        update_queries["LectureDetailData"]["params"].append(request.isFocus)
    if request.isExperimentDesign is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "isExperimentDesign = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.isExperimentDesign)
    if request.isELearning is not None:
        update_queries["LectureDetailData"]["fields"].append("isELearning = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.isELearning)
    if request.isArt is not None:
        update_queries["LectureDetailData"]["fields"].append("isArt = ?")
        update_queries["LectureDetailData"]["params"].append(request.isArt)
    if request.representCompetency is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "representCompetency = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.representCompetency)
    if request.learningGoalNmethod is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "learningGoalNmethod = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.learningGoalNmethod)
    if request.Overview is not None:
        update_queries["LectureDetailData"]["fields"].append("Overview = ?")
        update_queries["LectureDetailData"]["params"].append(request.Overview)
    if request.VCompetencyRatio is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "VCompetencyRatio = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.VCompetencyRatio)
    if request.LCompetencyRatio is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "LCompetencyRatio = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.LCompetencyRatio)
    if request.evaluationRatio is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "evaluationRatio = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.evaluationRatio)
    if request.mainBook is not None:
        update_queries["LectureDetailData"]["fields"].append("mainBook = ?")
        update_queries["LectureDetailData"]["params"].append(request.mainBook)
    if request.scheduleNcontent is not None:
        update_queries["LectureDetailData"]["fields"].append(
            "scheduleNcontent = ?")
        update_queries["LectureDetailData"]["params"].append(
            request.scheduleNcontent)

    if request.canTakeBunBan is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeBunBan = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeBunBan)
    if request.majorRecogBunBan is not None:
        update_queries["LectureConditions"]["fields"].append(
            "majorRecogBunBan = ?")
        update_queries["LectureConditions"]["params"].append(
            request.majorRecogBunBan)
    if request.canTakeOnly1year is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnly1year = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnly1year)
    if request.canTakeOnly2year is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnly2year = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnly2year)
    if request.canTakeOnly3year is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnly3year = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnly3year)
    if request.canTakeOnly4year is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnly4year = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnly4year)
    if request.canTakeOnly5year is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnly5year = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnly5year)
    if request.canTakeForeignPeople is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeForeignPeople = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeForeignPeople)
    if request.canTakeMultipleMajor is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeMultipleMajor = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeMultipleMajor)
    if request.canTakeOnlyAthlete is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnlyAthlete = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnlyAthlete)
    if request.canTakeOnlyChambit is not None:
        update_queries["LectureConditions"]["fields"].append(
            "canTakeOnlyChambit = ?")
        update_queries["LectureConditions"]["params"].append(
            request.canTakeOnlyChambit)
    if request.requirementClass is not None:
        update_queries["LectureConditions"]["fields"].append(
            "requirementClass = ?")
        update_queries["LectureConditions"]["params"].append(
            request.requirementClass)
    if request.lecLinkedMajorDifficulty is not None:
        update_queries["LectureConditions"]["fields"].append(
            "lecLinkedMajorDifficulty = ?")
        update_queries["LectureConditions"]["params"].append(
            request.lecLinkedMajorDifficulty)

    print(update_queries)

    if not any(len(query["fields"]) > 0 for query in update_queries.values()):
        raise HTTPException(status_code=400, detail="업데이트할 필드가 없습니다.")

    try:
        for table, query in update_queries.items():

            update_query = f"""
                UPDATE {table}
                SET {', '.join(query["fields"])}
                WHERE lectureID = ?
                """
            query["params"].append(lecture_id)

            cursor.execute(update_query, query["params"])
            conn.commit()

    except Exception as e:
        print(f"Error occurred: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


@router.post("/admin/edit/time")
async def admin_edit_time(request: AdminEditTime, password: str):
    conn = db_connect()
    cursor = conn.cursor()

    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_password != password:
        return 0

    try:
        cursor.execute("""
            UPDATE LectureList
            SET lecTime = ?
            WHERE lectureID = ?
        """, (request.lecTime, request.lectureID))

        cursor.execute("""
            SELECT year, semester, lecNumber FROM LectureList
            WHERE lectureID = ?
        """, (request.lectureID,))

        lecture_info = cursor.fetchone()

        if lecture_info is None:
            raise HTTPException(status_code=404, detail="lecture_info is None")

        year, semester, lecNumber = lecture_info

        cursor.execute("""
            UPDATE UserListedLecture
            SET lecTime = ?
            WHERE year = ? AND semester = ? AND lecNumber = ?
        """, (request.lecTime, year, semester, lecNumber))

        conn.commit()
        return {"message": "updated"}

    except Exception as e:
        print(e)
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
