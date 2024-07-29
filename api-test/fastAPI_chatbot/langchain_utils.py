from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from PRIVATE import openai_api_key

def get_chatbot_response(message):
    llm = ChatOpenAI(api_key=openai_api_key,
                 model="gpt-3.5-turbo")

    # 템플릿 설정
    prompt = ChatPromptTemplate.from_template("User: {message}\nChatbot: ")

    # 체인 생성
    chain = LLMChain(llm=llm, prompt=prompt)

    # LangChain 체인을 사용하여 응답 생성
    response = chain.run(message=message)
    return response.strip()
