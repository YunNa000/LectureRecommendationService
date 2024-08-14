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
                CASE 
                    WHEN EXISTS (SELECT 1 FROM LectureList WHERE year = l.year AND semester = '겨울학기') THEN '겨울학기'
                    WHEN EXISTS (SELECT 1 FROM LectureList WHERE year = l.year AND semester = '2학기') THEN '2학기'
                    WHEN EXISTS (SELECT 1 FROM LectureList WHERE year = l.year AND semester = '여름학기') THEN '여름학기'
                    WHEN EXISTS (SELECT 1 FROM LectureList WHERE year = l.year AND semester = '1학기') THEN '1학기'
                    ELSE NULL
                END AS semester
            FROM 
                LectureList l
            GROUP BY 
                year
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

        return {"year_n_semester": {"year": date[0], "semester": date[1]}}

    except Exception as e:
        conn.rollback()
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
