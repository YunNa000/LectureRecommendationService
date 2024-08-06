from fastapi import APIRouter, HTTPException
import db

router = APIRouter()


@router.get("/other/now_year_n_semester")
def get_latest_year_semester():
    conn = db.db_connect()
    cursor = conn.cursor()

    try:
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

        latest_year = latest_year_semester['year']
        latest_semester = latest_year_semester['semester']

        return {"latest_year": latest_year, "latest_semester": latest_semester}

    finally:
        conn.close()
