# Library Imports
import os
import certifi
from dotenv import load_dotenv

from langchain_ollama import ChatOllama
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain import hub

from langchain.agents import create_react_agent, AgentExecutor

# Environment setup
os.environ["SSL_CERT_FILE"] = certifi.where()
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# Setup Search Tool
from langchain_tavily import TavilySearch
search_tool = TavilySearch(
    api_key=TAVILY_API_KEY,
    max_results=5
)
result = search_tool.invoke("Give me the latest news on AI?")
result

# Configure Chat Provider: in this usecase it is Ollama
llm = ChatOllama(
    model="gemma4:e4b",
    temperature=0.7
)
response = llm.invoke("What year is it?")
response

# Loop engineering prompt for agent and agent executor
from langsmith import Client
client = Client()
prompt = client.pull_prompt(
    "hwchase17/react",
    dangerously_pull_public_prompt=True,
)
prompt

# Initialize agent and agent executor
tools = [search_tool]
agent = create_react_agent(
    llm=llm,
    tools=[search_tool],
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=[search_tool],
    verbose=True,
    handle_parsing_errors=True
)

# Get response
response = agent_executor.invoke({
    "input": (
        "What's the latest news on Dangote Refinery"
        "How can an entrepreneur in Tech and AI benefit from this news?"
        "Be concise and efficient with your answer."
    )
})
response["output"]