import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from router import auth, lectureCall, lectureSelect

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:3000/"
    "http://127.0.0.1:3000"
    "http://127.0.0.1:3000/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectureCall.router)
app.include_router(lectureSelect.router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
