<div align="center">
  <h1>✈️ VoyAIge</h1>
  <p><strong>Autonomous Multi-Agent Travel Orchestration Engine</strong></p>
  
  <p>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/Python-3.11-blue.svg?style=for-the-badge&logo=python&logoColor=white" alt="Python Version"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/LangGraph-FF0000?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/MCP-Protocol-purple.svg?style=for-the-badge" alt="MCP Protocol"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
  </p>
</div>

<br />

> **VoyAIge** is an open-source, state-of-the-art multi-agent travel planning system built on **LangGraph**, **Groq Llama 3.3**, **Model Context Protocol (MCP)**, and **FastAPI**. It features an intelligent **Supervisor Agent**, **Input Guardrails**, **Human-in-the-Loop (HITL) approval**, and multi-agent coordination for live flights, curated hotels, weather forecasts, and budget analysis.

---

## ✨ The Vision: Why VoyAIge?

Planning a trip typically requires juggling multiple search engines, flight aggregators, hotel sites, and weather apps. Standard single-prompt LLMs struggle with this, often hallucinating flight numbers or inventing non-existent hotel options.

**VoyAIge solves this by decoupling travel planning into a specialized, stateful multi-agent workflow with supervisor routing and human oversight:**

* **🛡️ Supervisor Agent & Input Guardrail:** Validates requests for travel-relevance and dynamically routes execution to required specialist agents.
* **✈️ Flight Agent:** Interrogates the live AviationStack API via MCP for real flight routes and schedule data.
* **🏨 Hotel Agent:** Executes targeted web search queries via Tavily MCP to source real-time accommodation deals.
* **🌤️ Weather Agent:** Queries OpenWeather API via a custom stdio MCP server for current weather and 5-day forecasts.
* **💰 Budget Agent:** Analyzes financial feasibility, cost bands, and money-saving advice.
* **🙋 Human-in-the-Loop (HITL) Review:** Pauses state execution using LangGraph `interrupt()` for human approval or revision feedback.
* **🗺️ Itinerary & Final Formatting Agent:** Synthesizes flight, hotel, weather, and budget findings into a cohesive daily schedule.

---

## 🏗️ Multi-Agent Architecture

```mermaid
graph TD
    User([User Request]) --> START[Start]
    START --> Supervisor[🛡️ Supervisor & Input Guardrail<br/><i>Relevance Check & Routing</i>]
    
    Supervisor -->|Valid Request| Flight[✈️ Flight Agent<br/><i>AviationStack MCP</i>]
    Supervisor -->|Valid Request| Hotel[🏨 Hotel Agent<br/><i>Tavily MCP</i>]
    Supervisor -->|Valid Request| Weather[🌤️ Weather Agent<br/><i>OpenWeather MCP</i>]
    Supervisor -->|Valid Request| Budget[💰 Budget Agent<br/><i>Groq Llama 3.3</i>]
    Supervisor -->|Blocked| Blocked[🚫 Guardrail Blocked<br/><i>Friendly Rejection</i>]
    
    Flight --> Itinerary[🗺️ Itinerary Agent<br/><i>Draft Generator</i>]
    Hotel --> Itinerary
    Weather --> Itinerary
    Budget --> Itinerary
    
    Itinerary --> HITL[🙋 Human Approval Step<br/><i>LangGraph Interrupt</i>]
    HITL -->|Approved / Revised| Final[✨ Final Formatting Agent<br/><i>Structured Markdown</i>]
    Final --> END[End Output]
    Blocked --> END

    subgraph State Persistence
        PostgreSQL[(PostgreSQL Checkpointer)] <==> Supervisor
        PostgreSQL <==> HITL
    end
```

### Agent Roles & Responsibilities

| Agent Node | Function | Tools / API | Output |
| :--- | :--- | :--- | :--- |
| **`supervisor_agent`** | Enforces input guardrails & dynamically routes work | Groq (`llama-3.3-70b-versatile`) | Agent routing list & trip constraints |
| **`flight_agent`** | Extracts route intent & queries real-time flight schedules | AviationStack MCP API | Flight status, airlines, schedule advice |
| **`hotel_agent`** | Researches top accommodation options matching target budget | Tavily Search MCP API | Hotel choices, pricing bands, locations |
| **`weather_agent`** | Fetches live weather conditions & 5-day forecast | OpenWeather stdio MCP Server | Weather breakdown & packing tips |
| **`budget_agent`** | Assesses financial feasibility & money-saving strategies | Groq (`llama-3.3-70b-versatile`) | Cost breakdown & budget risks |
| **`itinerary_agent`** | Builds cohesive day-by-day draft itinerary | Groq (`llama-3.3-70b-versatile`) | Draft itinerary for review |
| **`human_approval_agent`** | Pauses workflow execution for human review | LangGraph `interrupt()` | Approved boolean & revision feedback |
| **`final_agent`** | Formats final response into standardized markdown | Groq (`llama-3.3-70b-versatile`) | Polished final report |

---

## 🚀 Key Features

* **Input Guardrail & Security:** Automatically screens and rejects off-topic or unsafe prompts.
* **Dynamic Supervisor Routing:** Intelligently invokes only the specialist agents required for each prompt.
* **Human-in-the-Loop (HITL) Workflow:** Pauses thread execution allowing travelers to approve or request revisions before finalizing.
* **Model Context Protocol (MCP) Integration:** Communicates with external services via MCP adapters (Tavily HTTP, AviationStack stdio, OpenWeather stdio).
* **Live Flight & Weather Intelligence:** Real-time data lookup from AviationStack and OpenWeather.
* **Thread Memory & Session Persistence:** Integrated PostgreSQL checkpointer preserves trip context for multi-turn chats.
* **Liquid Glass Web UI:** Responsive modern frontend with quick prompt pills, SVG icons, and PDF export (`html2pdf.js`).

---

## 🛠️ Tech Stack Matrix

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | Python 3.11, FastAPI, Uvicorn |
| **Agentic Framework** | LangGraph, LangChain Core, `langchain-mcp-adapters` |
| **MCP Servers** | Tavily HTTP MCP, AviationStack stdio MCP, FastMCP OpenWeather Server |
| **LLM Provider** | Groq (`llama-3.3-70b-versatile`) |
| **Persistence & Memory** | PostgreSQL, `psycopg`, `langgraph-checkpoint-postgres` |
| **Frontend UI** | HTML5, Vanilla CSS (Liquid Glass), JavaScript (ES6+), Marked.js, Html2pdf.js |

---

## 📂 Project Structure

```text
voyaige-multi-agent/
├── app.py                         # FastAPI web application entrypoint & API routes
├── backend.py                     # LangGraph state graph, supervisor, HITL interrupt & Postgres checkpointer
├── mcp_client.py                  # MultiServerMCPClient configuration & helper functions
├── custom_weather_mcp_server.py   # FastMCP stdio server for OpenWeather API
├── requirements.txt               # Python package dependencies
├── Dockerfile                     # Container definition for production deployment
├── .dockerignore                  # Docker build exclusion rules
├── static/
│   ├── style.css                  # Liquid Glass styling & cute itinerary themes
│   └── script.js                  # Frontend interactive JS & high-res PDF generation
└── templates/
    └── index.html                 # Main web interface template
```

---

## ⚡ Getting Started

### Prerequisites

* **Python 3.10+**
* **PostgreSQL Database** (Local instance or Render / Supabase)
* **API Keys**:
  * [Groq API Key](https://console.groq.com/)
  * [Tavily Search API Key](https://tavily.com/)
  * [AviationStack API Key](https://aviationstack.com/)
  * [OpenWeather API Key](https://openweathermap.org/api)

### Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/voyaigememory
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
AVIATION_STACK_API_KEY=your_aviationstack_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dishu223/voyaige-multi-agent.git
   cd voyaige-multi-agent
   ```

2. **Set up a virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Launch the application**:
   ```bash
   python app.py
   ```
   *Access the web interface at **`http://127.0.0.1:8000`**.*

---

## 📡 API Reference

<details>
<summary><strong>GET /health — Health Check</strong></summary>

```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "message": "VoyAIge AI Travel Planner API is running",
  "features": [
    "supervisor_agent",
    "input_guardrail",
    "human_in_the_loop"
  ]
}
```

</details>

<details>
<summary><strong>POST /api/travel — Initiate Travel Plan</strong></summary>

```http
POST /api/travel
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Plan a complete 7 days Japan trip from Bangladesh including flights, hotels and sightseeing under 2 lakhs.",
  "thread_id": null
}
```

**Response:**
```json
{
  "success": true,
  "thread_id": "user_a1b2c3d4e5f6",
  "requires_approval": true,
  "approval_request": "Please review the generated draft itinerary...",
  "answer": "## 📝 Trip Summary\n...",
  "selected_agents": ["flight_agent", "hotel_agent", "weather_agent", "budget_agent", "itinerary_agent"]
}
```
</details>

<details>
<summary><strong>POST /api/travel/approve — Human-in-the-Loop Review</strong></summary>

```http
POST /api/travel/approve
Content-Type: application/json
```

**Request Body:**
```json
{
  "thread_id": "user_a1b2c3d4e5f6",
  "approved": true,
  "feedback": ""
}
```

**Response:**
```json
{
  "success": true,
  "thread_id": "user_a1b2c3d4e5f6",
  "requires_approval": false,
  "answer": "## 📝 Final Polished Itinerary\n...",
  "approved": true
}
```
</details>

---

## 🤝 Contributing

Contributions are welcome! If you'd like to extend agent capabilities, add new MCP servers, or refine the UI:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request.

---

<div align="center">
  <p>Distributed under the <strong>MIT License</strong>. See <a href="LICENSE">LICENSE</a> for details.</p>
  <p>Built with ❤️ for intelligent multi-agent travel orchestration.</p>
</div>