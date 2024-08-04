from langchain.chat_models import ChatOllama
from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder


ollama = ChatOllama(
    model="llama3:8b",
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)  # type: ignore

memory = ConversationSummaryBufferMemory(
    llm=ollama,
    max_token_limit=120,
    memory_key="chat_history",
    return_messages=True,
)

template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistent bot"),
    ("ai", "i'm useful assistent!"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
])

chain = LLMChain(
    llm=ollama,
    memory=memory,
    prompt=template,
    verbose=True,
)
