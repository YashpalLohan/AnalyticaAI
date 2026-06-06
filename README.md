# AnalyticaAI - AI Data Analyst Agent

> Talk to Your Data. Get Insights in Seconds.

**Live Demo:** [https://analytica-ai-eta.vercel.app](https://analytica-ai-eta.vercel.app)

![AnalyticaAI Landing Page](./image.png)

AnalyticaAI is a full-stack, Agentic AI-powered analytics platform that enables users to upload structured datasets and interact with them using natural language. The platform removes the need for SQL queries, manual data cleaning, dashboard configuration, and statistical analysis expertise. Users can simply upload a dataset and ask questions, and the system automatically performs data profiling, cleaning, exploratory data analysis, dashboard creation, insight generation, forecasting, machine learning, and report generation.

---

## 1. Executive Summary

Modern analytics tools require significant technical knowledge. Users often struggle with data preparation (missing values, duplicates), querying data (SQL knowledge), visualization (chart selection), machine learning (model training), and reporting.

AnalyticaAI solves this by creating the simplest way for anyone to understand data through conversation. It transforms complex data analysis into a natural chat experience where users receive actionable insights without technical expertise. The long-term vision is to create an autonomous business intelligence assistant capable of understanding datasets, monitoring trends, detecting risks, generating recommendations, and training predictive models.

---

## 2. Target Users and Use Cases

- **Business Analysts**: Faster reporting, automated dashboards, and rapid trend discovery without repetitive Excel work.
- **Startup Founders**: KPI tracking, revenue forecasting, and customer insights without needing a dedicated analyst.
- **Marketing Teams**: Campaign performance tracking, customer segmentation, and ROI analysis.
- **Product Managers**: Product usage insights, retention analysis, and growth monitoring.
- **Students**: Academic dataset research and project analysis support.

---

## 3. Core Features

### Data Management
- **Dataset Upload**: Drag and drop CSV, XLSX, or JSON files up to 100MB.
- **Dataset Workspace**: Secure storage, version management, and dataset history tracking.

### Automated Analysis
- **Data Profiling**: Automated row/column counts, missing values detection, duplicate identification, outlier spotting, and a generated dataset health score (0-100).
- **Data Cleaning**: AI-suggested fixes for missing values, duplicates, and outliers applied in one click.
- **Exploratory Data Analysis (EDA)**: Auto-generated histograms, bar charts, correlation heatmaps, and summary statistics.

### Agentic AI Interface
- **Natural Language Querying**: Ask questions in plain English using Groq's Llama 3.3 70B.
- **Insight Generation**: Automated business trends, risk detection, and recommendations.
- **Follow-up Suggestions**: AI-driven prompts to guide deeper analysis.

### Advanced Capabilities
- **Forecasting (Roadmap)**: Time-series predictions with confidence intervals using models like Prophet and XGBoost.
- **AutoML (Roadmap)**: Automated model selection, training, and evaluation for classification and regression tasks.
- **Reporting**: One-click generation of BI dashboards and exportable executive reports (PDF/DOCX).

---

## 4. System Architecture

The platform uses a modern, scalable six-layer architecture:

1. **Presentation Layer**: React.js, Vite, TypeScript, Tailwind CSS, Shadcn UI. Handles UI, dashboard rendering, and chat experience.
2. **API Gateway Layer**: FastAPI (Python 3.12). Acts as the entry point for all requests, handling authentication, dataset upload, and agent execution.
3. **Business Logic Layer**: Core services for user management, dataset versioning, chat storage, and report generation.
4. **AI Layer**: LangGraph, LangChain, Groq (Llama 3.3 70B). Powers intelligent analytics, dataset understanding, and agent coordination.
5. **Data Layer**: PostgreSQL 15 (Relational Data), ChromaDB (Vector Embeddings), and Local/Supabase Storage (Dataset files).
6. **Infrastructure Layer**: Redis + Celery for asynchronous background jobs.

---

## 5. Agentic Architecture (LangGraph)

Instead of a single LLM handling all tasks, AnalyticaAI uses a multi-agent system coordinated by an **Orchestrator Agent**. Each agent performs one responsibility exceptionally well and communicates through a shared state model.

### The Agents:
- **Dataset Understanding Agent**: Analyzes schema, classifies columns, and extracts business context.
- **Cleaning Agent**: Detects missing values, duplicates, outliers, and type corrections.
- **EDA Agent**: Generates statistical analysis, correlations, and visualization recommendations.
- **Insight Agent**: Converts data into business insights, identifying trends, risks, and opportunities.
- **Dashboard Agent**: Dynamically selects KPIs, charts, and layouts for auto-generated dashboards.
- **Report Agent**: Compiles findings into comprehensive executive and technical reports.
- **ML / Forecast Agents**: Manages AutoML pipelines and time-series future prediction generation.
- **Memory Agent (RAG)**: Maintains long-term memory of previous queries, insights, and dataset context using ChromaDB.

### Agent Communication Flow:
Dataset Upload -> Dataset Agent -> Cleaning Agent -> EDA Agent -> Insight Agent -> Dashboard Agent -> Report Agent.

All agents operate securely using a Tool Registry, ensuring they never directly manipulate data without proper tool abstraction (e.g., `generate_chart`, `detect_outliers`).

---

## 6. Project Structure

```
AnalyticaAI/
├── backend/
│   ├── app/
│   │   ├── agents/            # LangChain/LangGraph specialized agents
│   │   ├── api/v1/endpoints/  # Route handlers (auth, datasets, chat, eda)
│   │   ├── core/              # Config, DB, LLM factory, security, storage
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic
│   │   ├── tasks/             # Celery background tasks
│   │   └── main.py            # FastAPI app entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Pytest suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/               # Route-level pages (dashboard, datasets, auth)
│   │   ├── components/        # Shared UI (layout, navbar, sidebar)
│   │   ├── features/          # Feature modules (chat, eda, datasets)
│   │   ├── services/          # Axios API service functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state stores
│   │   └── lib/api-client.ts  # Axios instance with auth interceptors
│   ├── package.json
│   └── Dockerfile
│
├── sample-datasets/           # Test CSVs for development
├── .github/workflows/         # CI/CD pipelines
├── .env.example               # Environment variables template
├── docker-compose.yml         # Local infrastructure
└── README.md
```

---

## 7. Quick Start Setup Guide

### Prerequisites
- Python 3.12+
- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis)
- A free Groq API key (from console.groq.com)

### Step 1: Clone the Repository
```bash
git clone https://github.com/YashpalLohan/AnalyticaAI.git
cd AnalyticaAI
```

### Step 2: Start the Database Infrastructure
Make sure Docker Desktop is running, then start PostgreSQL (port 5432) and Redis (port 6379):
```bash
docker-compose up postgres redis -d
```
Data persists in Docker volumes across restarts.

### Step 3: Backend Setup
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Copy the example environment file and fill in your values:
```bash
cp ../.env.example .env
```

Minimum required values in `backend/.env`:
```env
DATABASE_URL=postgresql://analytica:analytica_password@localhost:5432/analytica_ai
GROQ_API_KEY=gsk_your_key_here
JWT_SECRET=your_32_char_secret_here
```

Run database migrations and start the FastAPI server:
```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### Step 5: Access the Application
- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs

---

## 8. Deployment Guide

### Database (Neon - Free Tier)
1. Create a project at neon.tech.
2. Copy the `asyncpg` connection string.
3. Set this as the `DATABASE_URL` environment variable.

### Storage (Supabase)
1. Create a project at supabase.com.
2. Create a public storage bucket named `analytica-ai`.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET=analytica-ai` in your environment variables.

### Backend (Render)
1. Create a new Web Service pointing to the repository.
2. Set Root Directory to `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all necessary environment variables.
6. After the first deploy, run migrations via the Render Shell: `alembic upgrade head`.

### Frontend (Vercel)
1. Import the repository in vercel.com.
2. Set the environment variable: `VITE_API_URL=https://your-backend.onrender.com/api/v1`
3. Deploy. SPA routing is handled via `frontend/vercel.json`.

---

## 9. Build Status

| Phase | Feature | Status |
|---|---|---|
| 0 | Foundation - Auth, routing, layout | Complete |
| 1 | Dataset Upload - CSV/XLSX/JSON, storage, listing | Complete |
| 2 | Data Profiling - Health score, column stats, cleaning | Complete |
| 3 | EDA & Visualizations - Auto charts, correlation, stats | Complete |
| 4 | AI Chat - Natural language queries on datasets | Complete |
| 5 | Dashboard Generation - One-click BI dashboard | Complete |
| 6 | Insights & Reports - AI insights + PDF/DOCX export | Complete |
| 7 | Polish & Deploy - Mobile responsive, error boundaries, deploy config | Complete |

---

## 10. API Specification Reference

Interactive Swagger docs are available at `http://localhost:8000/docs` when running locally.

Key endpoints include:
- `POST /api/v1/auth/register` : Register a new user
- `POST /api/v1/auth/login` : Login, receive JWT tokens
- `POST /api/v1/datasets/upload` : Upload a CSV/XLSX/JSON file
- `GET  /api/v1/datasets` : List datasets for current user
- `GET  /api/v1/datasets/{id}/profile` : Get profiling results
- `GET  /api/v1/datasets/{id}/eda` : Get EDA charts and statistics
- `POST /api/v1/chat/query` : Ask a natural language question
- `GET  /api/v1/chat/sessions/{id}` : List chat sessions for a dataset

---

## 11. Contributing

We welcome contributions! Please review `CONTRIBUTING.md` for branch naming conventions, commit message standards, code guidelines, and pull request checklists. 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes using conventional commits
4. Push and open a pull request against the `develop` branch

---