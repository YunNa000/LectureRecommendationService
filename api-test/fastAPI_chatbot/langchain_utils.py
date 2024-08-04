from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from PRIVATE import openai_api_key
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler


def get_chatbot_response(message):
    llm = ChatOpenAI(api_key=openai_api_key,
    model="gpt-3.5-turbo", 
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()])
    
    memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=120,
    memory_key="chat_history",)
    
    # 템플릿 설정
    prompt = ChatPromptTemplate.from_template("{chat_history} User: {message} chatbot:")

    # 체인 생성
    chain = LLMChain(llm=llm, 
                     memory=memory,
                     prompt=prompt,
                     verbose=True,)

    # LangChain 체인을 사용하여 응답 생성
    response = chain.run(message=message)
    return response.strip()
