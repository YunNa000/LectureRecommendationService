from fastapi import FastAPI, HTTPException, Query
import sqlite3

app = FastAPI()

DATABASE = '/home/ga111o/document/VSCode/LectureRecommendationService/data_preprocessing/kwu-lecture-database copy.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/search/")
def search_lecture(lecNumber: str = Query(None), lecClassName: str = Query(None)):
    conn = get_db_connection()
    cursor = conn.cursor()

    if lecNumber:
        cursor.execute("SELECT lecProfessor FROM LectureTable WHERE lecNumber = ?", (lecNumber,))
    elif lecClassName:
        cursor.execute("SELECT lecProfessor FROM LectureTable WHERE lecClassName = ?", (lecClassName,))
    else:
        raise HTTPException(status_code=400, detail="input lecNum or lecClassName")

    result = cursor.fetchone()
    conn.close()

    if result:
        return {"lecProfessor": result["lecProfessor"]}
    else:
        raise HTTPException(status_code=404, detail="cant find lecture")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
