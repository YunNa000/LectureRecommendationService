from typing import List, Dict
from fastapi import HTTPException, APIRouter
from db import db_connect
from model import CrawlingNewLecture
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.firefox.service import Service
import random
import re
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random
from selenium.common.exceptions import NoSuchElementException
import sqlite3
import os
import pandas as pd

router = APIRouter()

load_dotenv()


def driver_setting():
    driver_path = "/home/ga111o/document/VSCode/kwu-lecture-recommendation-service/main/server/router/gecko/geckodriver"
    options = webdriver.FirefoxOptions()
    # options.add_argument('--headless')
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument(
        "user-agent={Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36}")

    service = Service(executable_path=driver_path)
    driver = webdriver.Firefox(service=service, options=options)

    return driver


def extract_classrooms(time_classroom):
    classrooms = set()
    matches = re.findall(r'\((.*?)\)', time_classroom)
    for match in matches:
        classrooms.add(match.strip())
    return ','.join(classrooms)


def extract_lec_time(time_classroom):
    lec_times = []

    entries = time_classroom.split(", ")

    for entry in entries:
        match = re.match(r'([^\s]+)\s+([0-9,]+)교시\s+\((.*?)\)', entry)
        if match:
            day = match.group(1)
            periods = match.group(2).strip()

            periods_list = periods.split(',')
            for period in periods_list:
                period_num = int(period.strip())
                lec_times.append(f"({day_to_num(day)}:{period_num})")

    return ','.join(lec_times)


def day_to_num(day):
    days = {
        "월": 1,
        "화": 2,
        "수": 3,
        "목": 4,
        "금": 5,
        "토": 6,
        "일": 7,
    }
    return days.get(day, 0)


@router.post("/get_data")
async def get_data(request: CrawlingNewLecture):
    conn = db_connect()
    cursor = conn.cursor()

    year = request.year
    semester = request.semester
    lecNumber = request.lecNumber
    lecName = request.lecName

    if (lecName == ("" or None)) or (lecNumber == ("" or None)):
        print("둘 다 입력해야 하는 걸요")
        return {"message": "둘다입력해야하는걸요"}

    query = """
        SELECT COUNT(*) FROM LectureList 
        WHERE year = ? AND semester = ? AND lecNumber = ? AND lecName = ?
    """
    cursor.execute(query, (year, semester, lecNumber, lecName))
    count = cursor.fetchone()[0]

    if count > 0:
        print("이미강의가존재하는걸요")
        return {"message": "이미강의가존재하는걸요"}

    kii = os.getenv("kii")
    kpp = os.getenv("kpp")

    driver = driver_setting()

    try:
        driver.get("https://klas.kw.ac.kr/")
        time.sleep(1.5)

        driver.find_element(By.ID, "loginId").send_keys(f"{kii}")
        driver.find_element(By.ID, "loginPwd").send_keys(f"{kpp}")
        driver.find_element(By.ID, "loginPwd").send_keys(Keys.RETURN)

        time.sleep(1.5)

        driver.get("https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do")

        time.sleep(1.5)

        lecName = request.lecName

        input_lecName = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[1]/tbody/tr[2]/td[1]/input")
        input_lecName.click()

        input_lecName.send_keys(lecName)

        driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/div/button").click()

        time.sleep(1.5)
        tr_elements = driver.find_elements(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr")
        time.sleep(1)
        tr_count = len(tr_elements)
        time.sleep(1)
        for i in range(1, tr_count + 1):
            code = driver.find_element(
                By.XPATH, f"/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[{i}]/td[1]").text
            span_text = driver.find_element(
                By.XPATH, f"/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[{i}]/td[2]/span").text
            time.sleep(0.3)
            if code == request.lecNumber and span_text == lecName:
                driver.find_element(
                    By.XPATH, f"/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[{i}]/td[2]/span").click()
                break
        else:
            raise HTTPException(status_code=434, detail="cant find lecture")
        time.sleep(1)
        time_classroom = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[1]/tbody/tr[5]/td[1]").text
        lecClassification = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[1]/tbody/tr[2]/td[2]").text
        lecCredit_lecWeekTime = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[1]/tbody/tr[4]/td[2]").text
        lecProfessor = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[1]/tbody/tr[6]/td[1]").text
        year_semester = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[1]/tbody/tr[1]/td[2]").text

        splitted_year = year_semester.split('/')[0]
        splitted_semester = year_semester.split('/')[1]

        get_year = splitted_year[2:]
        if splitted_semester == "1":
            get_semester = "1학기"
        elif splitted_semester == "2":
            get_semester = "2학기"
        elif splitted_semester == "3":
            get_semester = "여름학기"
        elif splitted_semester == "4":
            get_semester = "겨울학기"
        else:
            get_semester = ""

        lecClassroom = extract_classrooms(time_classroom)
        lecTime = extract_lec_time(time_classroom)

        print(1)
        print(lecCredit_lecWeekTime)
        print(type(lecCredit_lecWeekTime))
        lecCredit = int(lecCredit_lecWeekTime.split("/")[0])
        print(2)
        lecWeekTime = int(lecCredit_lecWeekTime.split("/")[1])

        grade_ratio1 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[1]").text
        grade_ratio2 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[2]").text
        grade_ratio3 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[3]").text
        grade_ratio4 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[4]").text
        grade_ratio5 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[5]").text
        grade_ratio6 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[6]").text
        grade_ratio7 = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[13]/td/table/tbody/tr[2]/td[7]").text

        evaluationRatio = f"{grade_ratio1},{grade_ratio2},{grade_ratio3},{grade_ratio4},{grade_ratio5},{grade_ratio6},{grade_ratio7}"

        main_book = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[16]/td/table/tbody/tr[2]/td[2]").text

        overview = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[2]/td").text
        representCompetency = driver.find_element(
            By.XPATH, "/html/body/main/div/div/div/div[2]/div[2]/table[2]/tbody/tr[3]/td").text

        try:
            insert_query = '''
            INSERT INTO LectureList (lectureID, year, semester, lecNumber, lecName, lecProfessor, lecClassification, lecTheme, lecCredit, lecTime, lecWeekTime, lecClassroom, isLecClose)
            VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''

            cursor.execute(insert_query, (get_year, get_semester, lecNumber, lecName, lecProfessor,
                                          lecClassification, "", lecCredit, lecTime, lecWeekTime, lecClassroom, 0))

            lecture_id = cursor.lastrowid

            conn.commit()

            print(f"""
                year: {get_year}
                semester: {get_semester}
                lecNumber: {lecNumber}
                lecName: {lecName}
                lecProfessor: {lecProfessor}
                lecTime: {lecTime}
                lecClassification: {lecClassification}
                lecCredit: {lecCredit}
                lecClassroom: {lecClassroom}
            """)

            insert_detail_query = '''
            INSERT INTO LectureDetailData (lectureID, evaluationRatio, mainBook, overview, representCompetency)
            VALUES (?, ?, ?, ?, ?)
            '''

            cursor.execute(insert_detail_query, (lecture_id,
                           evaluationRatio, main_book, overview, representCompetency))

            conn.commit()

            print(f"""
                lecClassroom: {lecClassroom}
                evaluationRatio: {evaluationRatio}
                main_book: {main_book}
                overview: {overview}
                representCompetency: {representCompetency}
            """)

            return {
                "year": get_year,
                "semester": get_semester,
                "lectureID": lecture_id,
                "lecNumber": lecNumber,
                "lecName": lecName,
                "lecProfessor": lecProfessor,
                "lecTime": lecTime,
                "lecClassification": lecClassification,
                "lecCredit": lecCredit,
                "lecClassroom": lecClassroom,
                "evaluationRatio": evaluationRatio,
                "main_book": main_book,
                "overview": overview,
                "representCompetency": representCompetency,
            }

        except Exception as e:
            print(e)
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        driver.quit()
