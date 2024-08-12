from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler
from model import ChatRequest
from langchain_core.documents import Document
import pandas as pd
import os
import fitz

router = APIRouter()

class ChatInput(BaseModel):
    message: str
    
def load_system_prompt():
    try:
        file_path = r"D:/LectureRecommendationService/api-test\server\system_prompt.txt"
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        print("System prompt loaded successfully:", content[:100])  # 처음 100자만 출력
        return content
    except Exception as e:
        print(f"Error loading system prompt: {str(e)}")
        return ""

def load_and_process_documents():
    try:
        # PDF 파일 경로
        pdf_path = r"C:/Users/user\Desktop\3-3. 연계,창업,융합,kw-vip.pdf"
        
        # PDF 열기
        doc = fitz.open(pdf_path)
        
        full_text = ""
        for page in doc:
            # 페이지의 모든 텍스트 블록 추출
            blocks = page.get_text("blocks")
            for block in blocks:
                # 텍스트 블록의 내용 추가
                full_text += block[4] + "\n"
            full_text += "\n"  # 페이지 구분을 위한 추가 줄바꿈

        # 텍스트 분할
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(full_text)
        
        # Document 객체 생성
        documents = [Document(page_content=chunk) for chunk in chunks]
        
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# 벡터저장소
def create_vector_store(documents):
    embeddings = OpenAIEmbeddings() 
    vectorstore = FAISS.from_documents(documents, embeddings)
    return vectorstore


llm = ChatOpenAI(
    model="gpt-3.5-turbo-16k", 
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)


memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,
    memory_key="chat_history", 
    return_messages=True,
)

documents = load_and_process_documents()
vectorstore = create_vector_store(documents)

@router.post("/chat")
async def chat(request: ChatInput):
    user_message = request.message
    
    system_prompt = load_system_prompt()

    template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("ai", """당신은 광운대학교의 수강신청자료집 내용에 대해 답변하는 AI 어시스턴트입니다. 다음 지침을 따라 답변해 주세요:

            1. 업로드한 파일의 내용에 기반해야 합니다. 
            2. 정보가 불확실하거나 없는 경우, 정직하게 모른다고 말하세요.

            다음은 자주 묻는 질문과 그에 대한 답변 예시입니다:

            Q1: 인공지능융합대학 컴퓨터정보공학부 2학년입니다. 2024학년도 2학기 수강신청 일정이 어떻게 되나요?
            A1: 인공지능융합대학 컴퓨터정보공학부 2학년 학생의 2024학년도 2학기 수강신청 일정은 다음과 같습니다:
            - 본 수강신청: 2024년 8월 14일(화) ~ 8월 16일(목)
            자세한 내용은 수강신청자료집 5페이지 '수강신청 일정' 섹션을 참고하세요.

            Q2: 최대 신청 가능한 학점은 몇 학점인가요?
            A2: 일반적으로 최대 신청 가능 학점은 19학점입니다. 단, 직전 학기 평점 평균이 3.5 이상인 경우 22학점까지 신청 가능합니다. 자세한 내용은 수강신청자료집 10페이지 '학점 제한' 섹션을 참고하세요.

            Q3: 수강신청 정정 기간은 언제인가요?
            A3: 2024학년도 2학기 수강신청 정정 기간은 2024년 9월 4일(월)부터 월 7일(금)까지입니다. 이 기간 동안 수강신청 내역을 변경할 수 있습니다. 자세한 사항은 수강신청자료집 7페이지 '수강신청 변경' 섹션을 확인하세요.

            Q4: 재수강은 어떻게 신청하나요?
            A4: 재수강은 이전에 수강한 과목 중 C+ 이하의 성적을 받은 과목에 대해 가능합니다. 수강신청 시 해당 과목을 선택하면 자동으로 재수강으로 처리됩니다. 단, 재수강 시 최대 취득 가능 성적은 A0입니다. 자세한 내용은 수강신청자료집 15페이지 '재수강' 섹션을 참고하세요.

            Q5: 타과 전공 과목을 수강할 수 있나요?
            A5: 네, 타과 전공 과목 수강이 가능합니다. 단, 소속 학과의 전공 이수 학점을 우선적으로 채워야 합니다. 타과 전공 과목 수강 신청은 해당 학과의 여석 범위 내에서 가능하며, 일부 과목은 제한될 수 있습니다. 자세한 사항은 수강신청자료집 20페이지 '타과 전공 과목 수강' 섹션을 확인하세요.

            이러한 예시를 참고하여, 학생들의 질문에 정확하고 유용한 정보를 제공해 주세요. 질문의 맥락을 고려하여 관련된 추가 정보도 함께 제공하면 좋습니다. 준비되셨나요? 어떤 질문에 답변해 드릴까요?"""),
        
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", """질문: {question}

            질문하실 때 아래 사항을 포함해 주시면 더 정확한 답변을 드릴 수 있습니다:
            1. 귀하의 소속 단과대학 (예: 인공지능융합대학(인융대))
            2. 귀하의 전공 (예: 정보융합학부)
            3. 학년 (해당되는 경우)
            4. 구체적인 질문 내용 (한 번에 하나의 주제에 대해 질문해 주세요)

            예시: "인공지능융합대학 정보융합학부 2학년입니다. 2024학년도 1학기 수강신청 일정이 어떻게 되나요?"

            무엇을 도와드릴까요?"""),
    ])

    # ConversationalRetrievalChain을 사용하여 체인 생성
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        memory=memory,
        verbose=True
    )

    try:
        # LangChain 체인을 사용하여 응답 생성
        response = chain({"question": user_message})
        
        # response의 전체 구조를 출력
        print(response)
        
        bot_response = response.get("answer", "Sorry, I couldn't find the correct output key.").strip()

        return {"response": bot_response}
    
    except Exception as e:
        # 예외 발생 시 오류 메시지를 반환합니다.
        return {"response": f"오류가 발생했습니다: {str(e)}"}
