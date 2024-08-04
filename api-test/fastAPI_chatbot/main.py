from fastapi import FastAPI
from pydantic import BaseModel
from langchain_utils import get_chatbot_response
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message
    bot_response = get_chatbot_response(user_message)
    print("=====================", user_message)
    return {"response": bot_response}
