# AnalyticaAI

> Talk to Your Data. Get Insights in Seconds.

AnalyticaAI is a full-stack, agentic AI analytics platform. Upload any structured dataset — CSV, XLSX, or JSON — and interact with it through natural language. The platform automatically profiles, cleans, analyzes, visualizes, and generates business insights from your data without requiring SQL, Python, or any technical expertise.

![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Stack](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Stack](https://img.shields.io/badge/LangGraph-000000?style=flat&logo=langchain&logoColor=white)
![Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Stack](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## What It Does

| Step | Action |
|---|---|
| 1 | Upload a CSV, XLSX, or JSON dataset |
| 2 | Receive an automated data profile — health score, missing values, outliers |
| 3 | Apply one-click AI-suggested data cleaning |
| 4 | Explore auto-generated charts, correlations, and statistics |
| 5 | Ask questions in plain English via the AI chat interface |
| 6 | Get a generated dashboard with KPI cards, charts, and tables |
| 7 | Export insights and reports as PDF or DOCX |

---

## Tech Stack

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, Shadcn UI
- Recharts, Zustand, React Query

**Backend**
- FastAPI (Python 3.12)
- SQLAlchemy, Alembic
- Celery + Redis (async task queue)

**AI Layer**
- LangGraph (multi-agent orchestration)
- LangChain
- Groq — Llama 3.3 70B

**Database & Storage**
- PostgreSQL 15
- ChromaDB (vector memory / RAG)
- Supabase Storage

**Infrastructure**
- Vercel (frontend)
- Render (backend)
- Docker Compose (local development)

---

## Agentic Architecture

AnalyticaAI uses a LangGraph multi-agent pipeline. An Orchestrator Agent routes each user request to the appropriate specialist:

```
Dataset Upload
     │
     ▼
Dataset Agent       ← schema analysis, column classification
     │
     ▼
Cleaning Agent      ← missing values, duplicates, outliers
     │
     ▼
EDA Agent           ← statistics, correlations, chart recommendations
     │
     ▼
Insight Agent       ← trends, risks, opportunities
     │
     ▼
Dashboard Agent     ← KPI cards, chart layout, widget selection
     │
     ▼
Report Agent        ← PDF / DOCX report generation
```

A **Memory Agent** maintains long-term context across sessions using ChromaDB RAG, enabling follow-up questions that reference prior analysis.

---

## Project Structure

```
AnalyticaAI/
├── backend/
│   ├── app/
│   │   ├── agents/            # LangGraph agent definitions
│   │   ├── api/v1/endpoints/  # Auth, datasets, chat, EDA routes
│   │   ├── core/              # Config, DB, security, LLM factory
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic layer
│   │   ├── tasks/             # Celery background jobs
│   │   └── main.py            # FastAPI entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Pytest suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/               # Page-level routes
│   │   ├── components/        # Shared UI components
│   │   ├── features/          # Feature modules (chat, EDA, datasets)
│   │   ├── services/          # Axios API layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state stores
│   │   └── lib/api-client.ts  # Axios instance with auth interceptors
│   ├── package.json
│   └── Dockerfile
│
├── sample-datasets/           # Test CSVs for development
├── .github/workflows/         # CI/CD pipelines
├── .env.example               # Environment variable template
├── docker-compose.yml         # Local infrastructure
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker Desktop

### 1. Clone

```bash
git clone https://github.com/YashpalLohan/AnalyticaAI.git
cd AnalyticaAI
```

### 2. Start Infrastructure

```bash
docker-compose up postgres redis -d
```

### 3. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Copy the environment template and fill in your values:

```bash
cp ../.env.example .env
```

Minimum required values:

```env
DATABASE_URL=postgresql://analytica:analytica_password@localhost:5432/analytica_ai
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_32_char_secret
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Access

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## Deployment

### Backend — Render

1. Create a Web Service pointing to this repository.
2. Set Root Directory to `backend`.
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`.
6. After first deploy, run `alembic upgrade head` in the Render Shell.

### Frontend — Vercel

1. Import the repository in Vercel.
2. Set Framework Preset to **Vite**.
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api/v1`
4. Deploy. SPA routing is configured via `frontend/vercel.json`.

### Database — Neon (Free Tier)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the `asyncpg` connection string.
3. Set as `DATABASE_URL`.

### Storage — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Create a storage bucket named `analytica-ai`.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.

---

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login, receive JWT |
| POST | `/api/v1/datasets/upload` | Upload CSV/XLSX/JSON |
| GET | `/api/v1/datasets` | List user datasets |
| GET | `/api/v1/datasets/{id}/profile` | Get profiling results |
| GET | `/api/v1/datasets/{id}/eda` | Get EDA charts and statistics |
| POST | `/api/v1/chat/query` | Natural language query |
| GET | `/api/v1/chat/sessions/{id}` | Get chat history |

Full interactive docs available at `/docs` when running locally.

---

## Build Status

| Phase | Feature | Status |
|---|---|---|
| 0 | Foundation — Auth, routing, layout | Complete |
| 1 | Dataset Upload — CSV/XLSX/JSON, storage | Complete |
| 2 | Data Profiling — Health score, column stats, cleaning | Complete |
| 3 | EDA — Auto charts, correlations, statistics | Complete |
| 4 | AI Chat — Natural language queries | Complete |
| 5 | Dashboard Generation — One-click BI dashboard | Complete |
| 6 | Insights & Reports — AI insights, PDF/DOCX export | Complete |
| 7 | Polish & Deploy — Responsive, error boundaries, CI/CD | Complete |
| 8 | Forecasting — Prophet/XGBoost time-series (Roadmap) | Planned |
| 9 | AutoML — Classification/Regression pipeline (Roadmap) | Planned |

---

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` for branch naming conventions, commit message standards, and pull request guidelines.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using conventional commits
4. Open a pull request against the `develop` branch

---

## License

MIT