1. 디렉토리 구조 설정

server/
<br>|-- main.py
<br>|-- db.py
<br>|-- model.py
<br>|-- router/
<br>| |-- auth.py
<br>| |-- lecture.py
<br>| |-- user.py
<br>| |-- ocr.py
<br>|-- .env

2. main.py - app 생성 & 라우터 포함

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, lectures, users, ocr
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectures.router)
app.include_router(users.router)
app.include_router(ocr.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

---

3. db.py - db 연결

```python
import sqlite3

def db_connect():
    return conn
```

---

4. models.py - 모델 정의

```python
from pydantic import BaseModel
from typing import List, Optional, Dict, Union

class LectureRequest(BaseModel):

class LoggedInResponse(BaseModel):

class NotLoggedInResponse(BaseModel):

class PersonalInformation(BaseModel):

class userSelectedLecture(BaseModel):

class LecturesUpdateRequest(BaseModel):

class OCRRequest(BaseModel):

class OCRResponse(BaseModel):
```

---

5. routers/ - 각 엔드포인트를 처리하는 모듈

# routers/auth.py

```python
from fastapi import APIRouter, Cookie
from fastapi.responses import RedirectResponse
from models import LoggedInResponse, NotLoggedInResponse
from typing import Union
import os

router = APIRouter()

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
user_sessions = {}

@router.get("/", response_model=Union[LoggedInResponse, NotLoggedInResponse])
async def root(user_id: str = Cookie(None)):
    return {"message": "log in required"}


@router.get("/login")
async def login():


@router.get("/auth/callback")
async def auth_callback(code: str):
    return response
```

# routers/lectures.py

```python
from fastapi import APIRouter
from models import LectureRequest
from db import db_connect
from typing import List

router = APIRouter()

@router.post("/lectures", response_model=List[dict])
async def read_lectures(request: LectureRequest):
    return return_data
```

# routers/users.py

```python
from fastapi import APIRouter, Request
from models import PersonalInformation
from db import db_connect
from typing import List

router = APIRouter()

@router.get("/user/data", response_model=List[PersonalInformation])
async def get_user_data(request: Request):
    return users

@router.put("/user/update")
async def update_user_hakbun(request: PersonalInformation):
    return {"message": "updated"}
```

# routers/ocr.py

```python
from fastapi import APIRouter
from models import OCRRequest, OCRResponse
from db import db_connect
from typing import Dict

router = APIRouter()

@router.post("/user/update/ocr", response_model=OCRResponse)
async def process_text(request: OCRRequest):
    return OCRResponse(userTakenLectures=user_taken_lectures)
```
