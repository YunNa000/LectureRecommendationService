from typing import List, Dict
from fastapi import HTTPException, APIRouter
from db import db_connect

router = APIRouter()


@router.post("/get_year_n_semester")
async def get_year_n_semester():
    conn = db_connect()
    cursor = conn.cursor()

    try:

        cursor.execute(
            """SELECT 
                year,
                semester
            FROM 
                LectureList
            WHERE 
                lectureID = (
                    SELECT lectureID
                    FROM LectureList
                    ORDER BY lectureID DESC
                    LIMIT 1
                )
            ORDER BY 
                year DESC
            LIMIT 1;
            """
        )

        date = cursor.fetchone()

        cursor.close()
        conn.close()

        if not date:
            raise HTTPException(status_code=404, detail="No data found")

        year, semester = date

        if semester == "겨울학기":
            return {"year_n_semester": {"year": year, "semester": "겨울학기"}}
        elif semester == "2학기":
            return {"year_n_semester": {"year": year, "semester": "2학기"}}
        elif semester == "여름학기":
            return {"year_n_semester": {"year": year, "semester": "여름학기"}}
        else:
            return {"year_n_semester": {"year": year, "semester": "1학기"}}

    except Exception as e:
        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
