# AnalyticaAI — AI Data Analyst Agent

> Talk to Your Data. Get Insights in Seconds.

AnalyticaAI is a full-stack AI-powered analytics platform that lets users upload datasets and interact with them using natural language. No SQL, no code, no manual dashboard building.

---

## Demo

<!-- Add screenshots or a GIF here after building -->

| Upload Dataset | AI Chat | Dashboard |
|---|---|---|
| ![upload](docs/screenshots/upload.png) | ![chat](docs/screenshots/chat.png) | ![dashboard](docs/screenshots/dashboard.png) |

---

## Features

- **Automated Data Profiling** — row count, missing values, duplicates, outliers, health score
- **Data Cleaning Suggestions** — AI recommends and applies fixes
- **Exploratory Data Analysis** — histograms, correlations, summary statistics
- **AI Chat Interface** — ask questions in plain English, get charts and insights back
- **Dashboard Generation** — one-click KPI cards, charts, and tables
- **Insight Generation** — trends, risks, and opportunities detected automatically
- **Report Export** — download PDF or DOCX reports

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, TypeScript, Tailwind CSS, Shadcn UI, Recharts |
| Backend | FastAPI, Python 3.12, SQLAlchemy, Celery |
| Database | PostgreSQL |
| Vector DB | ChromaDB |
| AI Layer | LangChain, LangGraph, Groq (Llama 3.3) |
| Embeddings | Nomic (`nomic-embed-text`) |
| Storage | Supabase Storage (1GB free tier) |
| Queue | Redis (Upstash — 10K req/day free) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
AnalyticaAI/
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/     # Route handlers (auth, datasets, chat...)
│   │   │   └── router.py      # Registers all routes
│   │   ├── core/
│   │   │   ├── config.py      # Settings & env vars
│   │   │   ├── llm.py         # Groq LLM + embeddings factory
│   │   │   └── storage.py     # Storage factory (local / Supabase)
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic
│   │   ├── agents/            # LangGraph agents
│   │   ├── tasks/             # Celery background tasks
│   │   ├── utils/             # Shared utilities
│   │   └── main.py            # FastAPI app entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                  # React.js application (Vite + React Router)
│   ├── src/
│   │   ├── app/               # Route components (pages)
│   │   ├── components/        # Shared UI components
│   │   ├── features/          # Feature modules (auth, datasets, chat...)
│   │   ├── services/          # API service functions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Zustand state stores
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Shared utilities
│   │   └── lib/
│   │       └── api-client.ts  # Axios instance with auth interceptors
│   ├── public/                # Static assets
│   ├── package.json
│   └── Dockerfile
│
├── docs/                      # All project documentation
│   ├── 01-Product/            # PRD, App Flow, UI/UX Brief
│   ├── 02-Engineering/        # TRD, Architecture, DB Design, Agent Architecture
│   ├── 03-Execution/          # API Spec, MVP Roadmap, Sprints, Deployment Guide
│   ├── 04-Portfolio/          # Resume Case Study
│   ├── design-tokens/         # CSS tokens + Tailwind config
│   ├── error-codes/           # API error code registry
│   ├── prompts/               # LLM agent system prompts + few-shot examples
│   ├── scaffold-guide.md      # How to use this scaffold
│   └── context.txt            # Project context reference
│
├── sample-datasets/           # Test CSVs for development
│   ├── sales_data.csv
│   ├── customer_data.csv
│   └── README.md
│
├── .github/workflows/         # CI/CD pipelines
├── .env.example               # Environment variable reference
├── .gitignore
├── docker-compose.yml         # Full local dev stack
├── CONTRIBUTING.md
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 15+
- Redis
- Docker (optional)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/analytica-ai.git
cd analytica-ai
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Fill in values in .env
```

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

### 4. Or run manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app

```
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

---

## API Documentation

Full API spec: [`docs/03-Execution/08-API-Specification.md`](docs/03-Execution/08-API-Specification.md)

Interactive docs available at `http://localhost:8000/docs` when running locally.

---

## Architecture

See [`docs/02-Engineering/03-System-Architecture.md`](docs/02-Engineering/03-System-Architecture.md) for full architecture details.

---

## Development Sprints

See [`docs/03-Execution/10-Development-Sprints.md`](docs/03-Execution/10-Development-Sprints.md) for the 6-week build plan.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## License

MIT
