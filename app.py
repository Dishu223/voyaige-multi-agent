from pathlib import Path
import traceback
import uvicorn

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from backend import run_travel_agent

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="VoyAIge - Autonomous Multi-Agent Travel Planner",
    description=(
        "VoyAIge is an intelligent multi-agent travel orchestration engine powered by LangGraph, "
        "Groq Llama 3.3, AviationStack live flight data, and Tavily search. It constructs "
        "comprehensive, budget-aware travel itineraries, real-time flight details, and hotel recommendations "
        "with persistent PostgreSQL session memory."
    ),
    version="1.0.0"
)


app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static"
)


templates = Jinja2Templates(
    directory=str(BASE_DIR / "templates")
)