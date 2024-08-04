from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from langchain.chat_models import ChatOllama, ChatOpenAI
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from PRIVATE import openai_api_key


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


llm = ChatOpenAI(
    api_key=openai_api_key,
    model="gpt-3.5-turbo",
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)  # type: ignore

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=120,
    memory_key="chat_history",
    return_messages=True,
)


@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message

    template = ChatPromptTemplate.from_messages([
        ("system", "you are a useful assistent@"),
        ("ai", "i'm a bot of kwangwoon univ. lecture recommendation service"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ])

    chain = LLMChain(
        llm=llm,
        memory=memory,
        prompt=template,
        verbose=True,
    )

    # LangChain 체인을 사용하여 응답 생성
    response = chain.predict(question=user_message)

    bot_response = response.strip()

    print("=====================", user_message)
    return {"response": bot_response}
