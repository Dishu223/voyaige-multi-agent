<div align="center">
  <h1>✈️ VoyAIge</h1>
  <p><strong>Autonomous Multi-Agent Travel Orchestration Engine</strong></p>
  
  <p>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/Python-3.11-blue.svg?style=for-the-badge&logo=python&logoColor=white" alt="Python Version"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent"><img src="https://img.shields.io/badge/LangGraph-FF0000?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph"></a>
    <a href="https://github.com/Dishu223/voyaige-multi-agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License"></a>
  </p>
</div>

<br />

> **VoyAIge** is an open-source, state-of-the-art multi-agent travel planning system built on **LangGraph**, **Groq Llama 3.3**, and **FastAPI**. It turns complex, natural-language trip requests into structured, budget-aware travel plans featuring live flight schedules, curated hotel recommendations, and day-by-day itineraries.

---

## ✨ The Vision: Why VoyAIge?

Planning a trip typically requires juggling multiple search engines, flight aggregators, hotel sites, and itinerary notes. Standard single-prompt LLMs struggle with this, often hallucinating flight numbers or inventing non-existent hotel options.

**VoyAIge solves this by decoupling travel planning into a specialized, stateful multi-agent workflow:**

* **✈️ Flight Agent:** Interrogates the live AviationStack API for real flight routes and schedule data.
* **🏨 Hotel Agent:** Executes targeted web search queries via Tavily to source real-time accommodation deals.
* **🗺️ Itinerary Agent:** Synthesizes flight and hotel context into a logical, budget-conscious daily schedule using Groq's high-speed Llama 3.3 70B model.
* **✨ Final Formatting Agent:** Assembles structured Markdown reports optimized for both web display and PDF generation.
* **💾 PostgreSQL Checkpointer:** Persists conversation state across sessions using thread IDs.

---

## 🏗️ Multi-Agent Architecture

```mermaid
graph TD
    User([User Request]) --> START[Start]
    START --> FlightAgent[✈️ Flight Agent<br/><i>AviationStack API</i>]
    FlightAgent --> HotelAgent[🏨 Hotel Agent<br/><i>Tavily Search API</i>]
    HotelAgent --> ItineraryAgent[🗺️ Itinerary Agent<br/><i>Groq Llama 3.3 70B</i>]
    ItineraryAgent --> FinalAgent[✨ Final Formatting Agent<br/><i>Structured Markdown</i>]
    FinalAgent --> END[End Output]

    subgraph State Memory
        PostgreSQL[(PostgreSQL Checkpointer)] <==> FlightAgent
        PostgreSQL <==> HotelAgent
        PostgreSQL <==> ItineraryAgent
        PostgreSQL <==> FinalAgent
    end
```

### Agent Roles & Responsibilities

| Agent Node | Function | Tools / API | Output |
| :--- | :--- | :--- | :--- |
| **`flight_agent`** | Extracts route intent & queries real-time flight schedules | AviationStack API | Flight status, flight numbers, airlines |
| **`hotel_agent`** | Researches top accommodation options matching target budget | Tavily Search API | Hotel choices, pricing bands, locations |
| **`itinerary_agent`** | Builds a cohesive day-by-day trip schedule balancing logistics | Groq (`llama-3.3-70b-versatile`) | Daily itinerary & logistics breakdown |
| **`final_agent`** | Formats final response into 6 standardized markdown sections | Groq (`llama-3.3-70b-versatile`) | Final user report |

---

## 🚀 Key Features

* **Live Flight Intelligence:** Queries AviationStack for active carrier routes, flight numbers, and schedules.
* **Dynamic Accommodation Curation:** Discovers current hotel options, amenities, and location advice via Tavily.
* **Ultra-Fast LLM Inference:** Powered by Groq's Llama 3.3 70B Versatile engine for blazing-fast generation.
* **Thread Memory & Session Persistence:** Integrated PostgreSQL checkpointer preserves trip context for multi-turn chats.
* **Premium Glassmorphic Web UI:** A beautiful, responsive dark aesthetic frontend with quick prompt pills and instant PDF downloads (`html2pdf.js`).
* **Containerized Deployment:** Ready for production with included Dockerfile.

---

## 🛠️ Tech Stack Matrix

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | Python 3.11, FastAPI, Uvicorn |
| **Agentic Framework** | LangGraph, LangChain Core |
| **LLM Provider** | Groq (`llama-3.3-70b-versatile`) |
| **External APIs** | AviationStack (Live Flights), Tavily (Web Search) |
| **Persistence & Memory** | PostgreSQL, `psycopg`, `langgraph-checkpoint-postgres` |
| **Frontend UI** | HTML5, Vanilla CSS (Glassmorphism), JavaScript (ES6+), Marked.js, Html2pdf.js |

---

## 📂 Project Structure

```text
voyaige-multi-agent/
├── app.py                # FastAPI web application entrypoint & API routes
├── backend.py            # LangGraph state graph definitions, agent nodes & Postgres checkpointer
├── requirements.txt      # Python package dependencies
├── Dockerfile            # Container definition for production deployment
├── .dockerignore         # Docker build exclusion rules
├── static/
│   ├── style.css         # Glassmorphism dark theme CSS styling
│   └── script.js         # Frontend interactive JS & PDF generation logic
├── templates/
│   └── index.html        # Main web interface template
└── tools/
    ├── flight_tool.py    # AviationStack API wrapper for flight lookups
    └── tavily_tool.py    # Tavily API wrapper for web/hotel search
```

---

## ⚡ Getting Started

### Prerequisites

* **Python 3.10+**
* **PostgreSQL Database** (Local or cloud e.g., Render / Supabase)
* **API Keys**:
  * [Groq API Key](https://console.groq.com/)
  * [Tavily Search API Key](https://tavily.com/)
  * [AviationStack API Key](https://aviationstack.com/)

### Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/voyaigememory
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
AVIATION_STACK_API_KEY=your_aviationstack_api_key_here
DEFAULT_ORIGIN_IATA=DAC
```

### Option A: Local Installation

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

4. **Launch the app**:
   ```bash
   python app.py
   ```
   *Access the web interface at **`http://127.0.0.1:8000`**.*

### Option B: Docker Setup

1. **Build the Docker image**:
   ```bash
   docker build -t voyaige-app .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 --env-file .env --name voyaige-container voyaige-app
   ```

---

## 📡 API Reference

<details>
<summary><strong>Health Check</strong></summary>

```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "message": "AI Travel Planner API is running"
}
```

</details>

<details>
<summary><strong>Generate Travel Plan</strong></summary>

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
  "answer": "### Trip Summary\n...",
  "flight_results": "...",
  "hotel_results": "...",
  "itinerary": "...",
  "llm_calls": 2
}
```
</details>

---

## 🤝 Contributing

Contributions are always welcome! If you'd like to extend agent capabilities, add new API integrations (e.g., Google Places, Skyscanner), or refine the UI:

1. Fork the project repository.
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

<div align="center">
  <p>Distributed under the <strong>MIT License</strong>. See <a href="LICENSE">LICENSE</a> for more information.</p>
  <p>Built with ❤️ for intelligent travel orchestration.</p>
</div>