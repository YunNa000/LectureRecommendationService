import os
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from langchain.prompts import ChatPromptTemplate
from langchain.embeddings import CacheBackedEmbeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.schema import Document
from langchain.schema.runnable import RunnableLambda, RunnablePassthrough
from langchain.storage import LocalFileStore
from langchain_community.vectorstores import FAISS

app = FastAPI()
router = APIRouter()

llm = ChatOpenAI(
    temperature=0.1,
    streaming=True,
    model="gpt-4o-mini",
)

retriever = None


class Question(BaseModel):
    question: str


def embed_file(file_path: str):
    cache_dir = f"./.cache/embeddings/{os.path.basename(file_path)}"
    if os.path.exists(cache_dir):
        cache_store = LocalFileStore(cache_dir)
        embeddings = OpenAIEmbeddings()
        cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
            embeddings, cache_store)
        docs = [Document(page_content=open(file_path, "r").read())]
        vectorstore = FAISS.from_documents(docs, cached_embeddings)
        return vectorstore.as_retriever()
    else:
        with open(file_path, "r") as file:
            file_content = file.read()
        cache_store = LocalFileStore(cache_dir)
        docs = [Document(page_content=file_content)]
        embeddings = OpenAIEmbeddings()
        cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
            embeddings, cache_store)
        vectorstore = FAISS.from_documents(docs, cached_embeddings)
        return vectorstore.as_retriever()


def format_docs(docs):
    combined_docs = "\n\n".join(doc.page_content for doc in docs)
    return combined_docs


prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Answer the question using ONLY the following context. If you don't know the answer just say you don't know. DON'T make anything up.
            

            Context: {context}
            """,
        ),
        ("human", "{question}"),
    ]
)


@router.get("/files/")
async def list_files():
    files = os.listdir(
        "/home/ga111o/document/VSCode/kwu-lecture-recommendation-service/api-test/server/.cache/files")
    return {"files": files}


class SelectFileRequest(BaseModel):
    file_name: str


@router.post("/selectfile/")
async def select_file(request: SelectFileRequest):
    global retriever
    file_path = f"{request.file_name}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    retriever = embed_file(file_path)
    return {"filename": request.file_name, "message": "file embedded successfully"}


@router.post("/ask/")
async def ask_question(question: Question):
    if retriever is None:
        raise HTTPException(status_code=400, detail="No file selected")

    chain = (
        {
            "context": retriever | RunnableLambda(format_docs),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
    )
    response = chain.invoke(question.question)

    print(response.content)

    if isinstance(response, dict):
        return JSONResponse(content={"answer": response.content})
    else:
        return JSONResponse(content={"answer": str(response.content)})

app.include_router(router)
