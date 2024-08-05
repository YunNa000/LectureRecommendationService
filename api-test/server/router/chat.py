from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from fastapi import APIRouter
from model import ChatRequest
from langchain_openai import ChatOpenAI

router = APIRouter()


llm = ChatOpenAI(
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


@router.post("/chat")
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

    return {"response": bot_response}
