# AnalyticaAI — AI Data Analyst Agent

> Talk to Your Data. Get Insights in Seconds.

AnalyticaAI is a full-stack AI-powered analytics platform that lets users upload datasets and interact with them using natural language. No SQL, no code, no manual dashboard building.

---

## Build Status

| Phase | Feature | Status |
|---|---|---|
| 0 | Foundation — Auth, routing, layout | ✅ Complete |
| 1 | Dataset Upload — CSV/XLSX/JSON, storage, listing | ✅ Complete |
| 2 | Data Profiling — Health score, column stats, cleaning | ✅ Complete |
| 3 | EDA & Visualizations — Auto charts, correlation, stats | ✅ Complete |
| 4 | AI Chat — Natural language queries on datasets | ✅ Complete |
| 5 | Dashboard Generation — One-click BI dashboard | 🔜 Planned |
| 6 | Insights & Reports — AI insights + PDF/DOCX export | 🔜 Planned |
| 7 | Polish & Deploy — Production build, live URL | 🔜 Planned |

---

## Features (Live)

- **User Authentication** — Register, login, JWT-based sessions with refresh tokens
- **Dataset Upload** — Drag & drop CSV, XLSX, or JSON files up to 100MB
- **Automated Data Profiling** — Row/column counts, missing values, duplicates, outliers, health score (0–100)
- **Column-level Analysis** — Data types, null percentages, unique counts, sample values per column
- **Data Cleaning** — AI-suggested fixes applied in one click
- **Exploratory Data Analysis** — Auto-generated histograms, bar charts, correlation heatmap, summary statistics
- **AI Chat Interface** — Ask questions in plain English using Groq's Llama 3.3 70B, get answers with follow-up suggestions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Query, Recharts |
| Backend | FastAPI, Python 3.12, SQLAlchemy (async), Alembic |
| Database | PostgreSQL 15 |
| AI / LLM | LangChain, LangGraph, Groq (Llama 3.3 70B) |
| Embeddings | Nomic `nomic-embed-text` (via Ollama or Nomic API) |
| Vector DB | ChromaDB |
| Storage | Local filesystem (dev) / Supabase Storage (prod) |
| Queue | Redis + Celery |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
AnalyticaAI/
├── backend/
│   ├── app/
│   │   ├── agents/            # LangChain agents (chat)
│   │   ├── api/v1/endpoints/  # Route handlers (auth, datasets, chat, eda, profile)
│   │   ├── core/              # Config, DB, LLM factory, security, storage
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic
│   │   ├── tasks/             # Celery background tasks
│   │   └── main.py            # FastAPI app entry point
│   ├── alembic/               # Database migrations
│   ├── tests/
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
├── docs/                      # Architecture, PRD, API spec, build phases
├── sample-datasets/           # Test CSVs for development
├── .github/workflows/         # CI/CD pipelines
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- A free [Groq API key](https://console.groq.com)

### 1. Clone

```bash
git clone https://github.com/YashpalLohan/AnalyticaAI.git
cd AnalyticaAI
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Copy the example env and fill in your values:

```bash
cp ../.env.example .env
```

Minimum required values in `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/analytica_ai
GROQ_API_KEY=gsk_your_key_here
JWT_SECRET=your_32_char_secret_here
```

Run migrations and start:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Docker (optional)

Spin up the full stack with one command:

```bash
docker-compose up --build
```

---

## Environment Variables

Full reference in [`.env.example`](.env.example).

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Groq API key — get one free at [console.groq.com](https://console.groq.com) |
| `JWT_SECRET` | Random 32+ character string for signing tokens |
| `STORAGE_PROVIDER` | `local` (dev) or `supabase` (prod) |
| `EMBEDDING_PROVIDER` | `ollama` (local) or `nomic_api` (cloud) |

---

## API

Interactive Swagger docs at `http://localhost:8000/docs` when running locally.

Key endpoints:

```
POST /api/v1/auth/register        Register a new user
POST /api/v1/auth/login           Login, receive JWT tokens
POST /api/v1/datasets/upload      Upload a CSV/XLSX/JSON file
GET  /api/v1/datasets             List datasets for current user
GET  /api/v1/datasets/{id}/profile  Get profiling results
GET  /api/v1/datasets/{id}/eda    Get EDA charts and statistics
POST /api/v1/chat/query           Ask a natural language question
GET  /api/v1/chat/sessions/{id}   List chat sessions for a dataset
GET  /api/v1/health               Health check
```

Full spec: [`docs/03-Execution/08-API-Specification.md`](docs/03-Execution/08-API-Specification.md)

---

## Architecture

See [`docs/02-Engineering/03-System-Architecture.md`](docs/02-Engineering/03-System-Architecture.md).

The AI chat pipeline:

```
User question
    → FastAPI endpoint
    → load dataset from storage → parse to DataFrame
    → LangChain pandas agent (Groq Llama 3.3 70B)
    → agent executes Python against the DataFrame
    → returns answer + follow-up suggestions
    → saved to chat_messages table
    → response to frontend
```

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## License

MIT
