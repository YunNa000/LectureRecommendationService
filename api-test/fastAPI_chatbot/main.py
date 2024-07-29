from fastapi import FastAPI, Request
from pydantic import BaseModel
from langchain_utils import get_chatbot_response

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def read_root():
    return {"message": "인사말"}

@app.post("/chat")
async def chat(chat_request: ChatRequest):
    user_message = chat_request.message
    bot_response = get_chatbot_response(user_message)
    return {"response": bot_response}

@app.get("/return")
async def return_button():
    return {"message": "Returning to the main page."}
