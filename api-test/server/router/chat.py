import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler
from model import ChatRequest
from langchain.chains import LLMChain
# pip install fastapi uvicorn pydantic langchain langchain-community langchain-openai openai faiss-cpu pypdf python-multipart python-dotenv && pip install --upgrade langchain langchain-community langchain-openai


router = APIRouter()

class ChatInput(BaseModel):
    message : str
    
def load_and_process_documents():
    # html_loader = UnstructuredHTMLLoader(".html")
    pdf_loader = PyPDFLoader(r"C:/Users/user\Desktop/2024-2 수강신청자료집(전체).pdf")
    
    # html_data = html_loader.load()
    pdf_data = pdf_loader.load()
    
    # all_data = html_data + pdf_data
    
    text_splitter = CharacterTextSplitter(chunk_size=600, chunk_overlap=100)
    documents = text_splitter.split_documents(pdf_data)
    
    return documents

# 벡터저장소
def create_vector_store(documents):
    embeddings = OpenAIEmbeddings()
    vectorstore = FAISS.from_documents(documents, embeddings)
    return vectorstore

llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=120,
    memory_key="chat_history",
    return_messages=True,
)

documents = load_and_process_documents()
vectorstore = create_vector_store(documents)


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
