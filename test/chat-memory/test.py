from langchain.memory import ConversationSummaryBufferMemory
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.chat_models import ChatOllama

ollama = ChatOllama(
    model="llama3.2:1b",
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()]
)

memory = ConversationSummaryBufferMemory(
    llm=ollama,
    max_token_limit=120,
    return_messages=True,
)

template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI talking to a human"),
    ("ai", "my name is GA111O!"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}"),
])


def load_memory(_):
    return memory.load_memory_variables({})["history"]


chain = RunnablePassthrough.assign(history=load_memory) | template | ollama


def invoke_chain(question):
    result = chain.invoke({"question": question})
    memory.save_context({
        "input": question},
        {"output": result.content},
    )
    print(result)


invoke_chain("my name is Yamll!")
invoke_chain("what's my name?")
