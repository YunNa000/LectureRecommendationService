import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from router import auth, lectureCall, lectureSelect, user, lectureTaken, getYearSemester, lectureListed, chat, admin, friend, lectureDetail, lectureDetail, crawlingNewLecture


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectureCall.router)
app.include_router(lectureSelect.router)
app.include_router(user.router)
app.include_router(lectureTaken.router)
app.include_router(getYearSemester.router)
app.include_router(lectureListed.router)
app.include_router(friend.router)
app.include_router(lectureDetail.router)
app.include_router(chat.router)
app.include_router(admin.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
