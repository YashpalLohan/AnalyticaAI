# Project Scaffold

This folder contains the starter skeleton for the AnalyticaAI codebase.

Copy the `backend/` and `frontend/` folders into your actual project root to get started.

## Structure

```
project-scaffold/
│
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app entry point
│   │   ├── core/
│   │   │   └── config.py        ← Settings / env var loading
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── router.py    ← All route registrations
│   │   ├── models/              ← SQLAlchemy models (you build these)
│   │   ├── schemas/             ← Pydantic request/response schemas
│   │   ├── services/            ← Business logic
│   │   ├── agents/              ← LangGraph agents
│   │   ├── tasks/               ← Celery background tasks
│   │   └── utils/               ← Shared utilities
│   ├── alembic/
│   │   └── env.py               ← Alembic migration config
│   ├── tests/                   ← Pytest tests
│   ├── requirements.txt         ← All dependencies (pinned)
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/                 ← Next.js app router pages
│   │   ├── components/          ← Shared UI components
│   │   ├── features/            ← Feature modules (auth, datasets, chat...)
│   │   ├── services/            ← API service functions
│   │   ├── hooks/               ← Custom React hooks
│   │   ├── store/               ← Zustand state stores
│   │   ├── types/               ← TypeScript type definitions
│   │   ├── lib/
│   │   │   └── api-client.ts    ← Axios instance with auth interceptors
│   │   └── utils/               ← Shared utilities
│   ├── public/                  ← Static assets
│   ├── package.json             ← All dependencies (pinned)
│   └── Dockerfile
│
└── sample-datasets/             ← Test CSVs for development
    ├── sales_data.csv
    ├── customer_data.csv
    └── README.md
```

## First Steps After Copying

1. Copy `.env.example` from root → `.env`, fill in values
2. Run `docker-compose up` from project root
3. Run `cd backend && alembic upgrade head` for DB migrations
4. Open `http://localhost:3000` for frontend
5. Open `http://localhost:8000/docs` for API docs
6. Use sample datasets from `sample-datasets/` to test features
