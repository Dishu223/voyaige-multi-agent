import os
import certifi
from dotenv import load_dotenv

load_dotenv()

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

from typing import TypedDict, Annotated
import operator
import uuid

import psycopg
from psycopg.rows import dict_row

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
)
from langchain_groq import ChatGroq
from tools.tavily_tool import tavily_search
from tools.flight_tool import search_flights


def get_database_url():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError(
            "DATABASE_URL is missing. Please add your Render PostgreSQL External Database URL to .env"
        )

    if "sslmode=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"

    return database_url


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing. Please add it to your .env file.")


# ============================================
# LLM
# ============================================

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY
)


# ============================================
# State Schema
# ============================================

class TravelState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    user_query: str
    flight_results: str
    hotel_results: str
    itinerary: str
    llm_calls: int


# ============================================
# Flight Agent
# ============================================

def flight_agent(state: TravelState):
    query = state["user_query"]
    flight_data = search_flights(query)

    return {
        "flight_results": flight_data,
        "messages": [
            AIMessage(content="Flight results fetched.")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }


# ============================================
# Hotel Agent
# ============================================

def hotel_agent(state: TravelState):
    query = f"Best hotels for {state['user_query']}"
    hotel_results = tavily_search(query)

    return {
        "hotel_results": hotel_results,
        "messages": [
            AIMessage(content="Hotel information fetched.")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }


# ============================================
# Itinerary Agent
# ============================================

def itinerary_agent(state: TravelState):
    prompt = f"""
Create a complete travel itinerary.

User Query:
{state['user_query']}

Flight Results:
{state['flight_results']}

Hotel Results:
{state['hotel_results']}

Make the itinerary practical, budget-aware, and easy to follow.
"""

    response = llm.invoke([
        SystemMessage(content="You are an expert travel planner."),
        HumanMessage(content=prompt)
    ])

    return {
        "itinerary": response.content,
        "messages": [response],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

