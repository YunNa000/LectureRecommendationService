from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, condecimal
from typing import List, Optional
import sqlite3
import uvicorn

app = FastAPI()

def db_connect():
    conn = sqlite3.connect('./kwu-lecture-database-v3.db')
    conn.row_factory = sqlite3.Row
    return conn

class LectureRequest(BaseModel):
    bunban: str
    sub_name: str
    star: Optional[float] = None


@app.post("/lectures", response_model=List[dict])
def read_lectures(request: LectureRequest):
    conn = db_connect()
    cursor = conn.cursor()
    
    query = """
    SELECT lecClassName, lecNumber
    FROM LectureTable
    WHERE lecCanTakeBunban LIKE ?
    AND lecSubName = ?
    """
    
    parameters = [f"%{request.bunban}%", request.sub_name]

    if request.star is not None:
        query += " AND lecStars >= ?"
        parameters.append(request.star)

    cursor.execute(query, parameters)
    lectures = cursor.fetchall()
    
    conn.close()
    
    if not lectures:
        raise HTTPException(status_code=404, detail="bunban, sub_name, star에 맞는 강의가 없어요..😢")
    
    return [{"lecClassName": lecture["lecClassName"], "lecNumber": lecture["lecNumber"]} for lecture in lectures]

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
