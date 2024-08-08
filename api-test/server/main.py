import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from router import user, auth, lecture, ocr, chat, lectureTotal, friend, other, creditList, userInfo

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:3000/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(lecture.router)
app.include_router(ocr.router)
app.include_router(chat.router)
app.include_router(friend.router)
app.include_router(lectureTotal.router)
app.include_router(other.router)
app.include_router(creditList.router)
app.include_router(userInfo.router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
