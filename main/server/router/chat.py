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
from langchain.embeddings import CacheBackedEmbeddings, OllamaEmbeddings
from langchain.chat_models import ChatOllama
# from .PRIVATE import OPENAI_API_KEY

app = FastAPI()
router = APIRouter()

embeddings = OllamaEmbeddings()

llm = ChatOllama(
    temperature=0.1, 
    streaming=True, 
    model="llama3:8b", 
    )

# embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

# llm = ChatOpenAI(
#     temperature=0.1, 
#     streaming=True, 
#     model="gpt-3.5-turbo", 
#     openai_api_key=OPENAI_API_KEY)


# 테마별 retriever를 저장할 딕셔너리
theme_retrievers = {}

# MD 파일이 저장된 디렉토리 경로
MD_DIR = r"D:/LectureRecommendationService/main\server/.cache\data_"

# 테마별 MD 파일 매핑
THEME_FILES = {
    "수강신청": ["수강신청.md"],
    "졸업요건": [
        "졸업이수학점 안내 (19년 이후 신입학자).md",
        "졸업이수학점 안내 (공학인증학과, 19년 이후 신입학자).md",
        "졸업이수학점 안내 (다전공, 19년 이후 신입학자).md"
    ],
    "기타학사정보": [
        "공학교육인증제.md", "교양 필수 교과목 수강 안내.md", "다전공 안내.md",
        "다학년 다학기 프로젝트 (KW-VIP) 안내.md", "매치업 집중이수제 교내 강좌 수강 안내.md",
        "서비스러닝 교과목 안내.md", "연계전공 안내.md", "참빛설계학기 안내.md",
        "특별교육과정 (CDP, R.O.T.C., 글로벌인재트랙인증제).md", "편입생이 이수해야 할 교과목 및 학점.md",
        "학-석사 연계과정.md", "현장실습학기제 안내.md", "K-MOOC 교내 온라인강좌 수강 안내.md"
    ],
    "교내전화번호안내": ["교내전화번호안내.md"]
}

class Question(BaseModel):
    theme: str
    question: str

def embed_file(file_path: str):
    cache_dir = f"./.cache/embeddings/{os.path.basename(file_path)}"
    if os.path.exists(cache_dir):
        cache_store = LocalFileStore(cache_dir)
        embeddings = OpenAIEmbeddings()
        cached_embeddings = CacheBackedEmbeddings.from_bytes_store(
            embeddings, cache_store)
        docs = [Document(page_content=open(file_path, "r", encoding='utf-8').read())]
        vectorstore = FAISS.from_documents(docs, cached_embeddings)
        return vectorstore.as_retriever()
    else:
        with open(file_path, "r", encoding='utf-8') as file:
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
            당신은 광운대학교의 학사정보를 안내하는 챗봇입니다. 주어진 컨텍스트만을 사용하여 질문에 답변하세요. 
            답변을 모를 경우 모른다고 말하세요. 절대로 없는 정보를 만들어내지 마세요.
            학생들에게 친절하고 도움이 되는 태도로 답변해주세요.

            Context: {context}
            """,
        ),
        ("human", "{question}"),
    ]
)

@router.get("/themes/")
async def list_themes():
    return {"themes": list(THEME_FILES.keys())}

class ThemeSelect(BaseModel):
    theme: str

@router.post("/selecttheme/")
async def select_theme(theme_select: ThemeSelect):
    try:
        theme = theme_select.theme
        print(f"Selecting theme: {theme}")
        if theme not in THEME_FILES:
            print(f"Theme not found: {theme}")
            raise HTTPException(status_code=404, detail="Theme not found")
        
        if theme not in theme_retrievers:
            combined_content = ""
            for file_name in THEME_FILES[theme]:
                file_path = os.path.join(MD_DIR, file_name)
                try:
                    with open(file_path, "r", encoding='utf-8') as file:
                        combined_content += file.read() + "\n\n"
                except FileNotFoundError:
                    print(f"File not found: {file_path}")
                    raise HTTPException(status_code=500, detail=f"File not found: {file_name}")
                except Exception as e:
                    print(f"Error reading file {file_path}: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Error reading file: {file_name}")
            
            cache_dir = f"./.cache/embeddings/{theme}"
            cache_store = LocalFileStore(cache_dir)
            embeddings = OpenAIEmbeddings()
            cached_embeddings = CacheBackedEmbeddings.from_bytes_store(embeddings, cache_store)
            docs = [Document(page_content=combined_content)]
            vectorstore = FAISS.from_documents(docs, cached_embeddings)
            theme_retrievers[theme] = vectorstore.as_retriever()

        print(f"Theme selected successfully: {theme}")
        return {"message": f"{theme} 테마가 선택되었습니다."}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error in select_theme: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.post("/chatbot/") 
async def ask_question(question: Question):
    print(f"Received question: {question}")  # 로깅 추가
    if question.theme not in theme_retrievers:
        print(f"Theme not selected: {question.theme}")  # 로깅 추가
        raise HTTPException(status_code=400, detail="Theme not selected")

    retriever = theme_retrievers[question.theme]

    try:
        chain = (
            {
                "context": retriever | RunnableLambda(format_docs),
                "question": RunnablePassthrough(),
            }
            | prompt
            | llm
        )
        response = chain.invoke(question.question)

        print(f"Generated response: {response.content}")  # 로깅 추가

        if isinstance(response, dict):
            return JSONResponse(content={"answer": response.content})
        else:
            return JSONResponse(content={"answer": str(response.content)})
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # 로깅 추가
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

app.include_router(router)