# AnalyticaAI — Phase-by-Phase Build Plan

> Each phase is a **working, demonstrable mini-project**.
> Never move to the next phase until the current one passes its demo test.

---

## Overview

| Phase | Name | What You Ship | Time |
|---|---|---|---|
| 0 | Foundation | Running app with auth | 3–4 days |
| 1 | Dataset Upload | Upload + store + list datasets | 2–3 days |
| 2 | Data Profiling & Cleaning | Auto-profile + health score + cleaning suggestions | 4–5 days |
| 3 | EDA & Visualizations | Auto-generated charts + stats | 4–5 days |
| 4 | AI Chat | Talk to your data in natural language | 5–6 days |
| 5 | Dashboard Generation | One-click auto dashboard | 4–5 days |
| 6 | Insights & Reports | AI insights + PDF/DOCX export | 4–5 days |
| 7 | Polish & Deploy | Production-ready, live URL | 3–4 days |

**Total: ~5–6 weeks**

---

---

# PHASE 0 — Foundation

## What You're Building
A working full-stack skeleton with user authentication. At the end of this phase you have a real running app — register, login, logout, protected routes. Nothing more, nothing less.

## Demo Test ✅
> Open the app in a browser → register → login → see a dashboard home page → logout → try accessing dashboard without login → get redirected.

---

## Backend Tasks

### 1. Project Setup
```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py       ← env vars
│   │   ├── database.py     ← SQLAlchemy engine + session
│   │   └── security.py     ← password hashing, JWT
│   ├── models/
│   │   └── user.py         ← User ORM model
│   ├── schemas/
│   │   └── auth.py         ← Register/Login Pydantic schemas
│   ├── api/v1/
│   │   └── endpoints/
│   │       └── auth.py     ← /register, /login, /logout, /refresh
│   └── services/
│       └── auth_service.py
├── alembic/
├── requirements.txt
└── .env
```

### 2. Database
- Create `users` table via Alembic migration
- Fields: `id`, `full_name`, `email`, `password_hash`, `is_verified`, `created_at`

### 3. Auth Endpoints
```
POST /api/v1/auth/register   → create user, return user_id
POST /api/v1/auth/login      → validate, return access + refresh tokens
POST /api/v1/auth/logout     → invalidate token
POST /api/v1/auth/refresh    → issue new access token
GET  /api/v1/users/me        → return current user (protected)
GET  /api/v1/health          → {"status": "healthy"}
```

### 4. Key Rules
- Passwords hashed with `bcrypt`
- JWT access token: 15 min expiry
- JWT refresh token: 7 days expiry
- All protected routes require `Authorization: Bearer <token>` header

---

## Frontend Tasks

### 1. Project Setup
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── (dashboard)/
│   │       └── DashboardPage.tsx   ← protected, empty for now
│   ├── components/
│   │   ├── ui/                     ← Shadcn components
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx         ← empty for now
│   ├── services/
│   │   └── auth.service.ts         ← API calls for auth
│   ├── store/
│   │   └── auth.store.ts           ← Zustand auth state
│   ├── hooks/
│   │   └── useAuth.ts
│   └── lib/
│       └── api-client.ts           ← Axios + interceptors
├── vite.config.ts
├── tailwind.config.ts
└── .env
```

### 2. Pages to Build
- **Landing Page** — hero section, CTA button "Get Started"
- **Register Page** — name, email, password fields + validation
- **Login Page** — email, password + "Forgot password?" link
- **Dashboard Home** — just a welcome message + sidebar for now

### 3. Auth Flow
- On login success → save `access_token` to localStorage → redirect to `/dashboard`
- Axios interceptor → attach token to every request
- On 401 → clear token → redirect to `/login`
- Protected route wrapper → if no token → redirect to `/login`

---

## Phase 0 Checklist
- [ ] `GET /health` returns 200
- [ ] User can register with email + password
- [ ] Duplicate email returns 409 error
- [ ] User can login and receive JWT
- [ ] Wrong password returns 401
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] Navbar shows user name when logged in
- [ ] Logout clears token and redirects to landing page
- [ ] App runs with `docker-compose up`

---

---

# PHASE 1 — Dataset Upload

## What You're Building
Users can upload CSV/XLSX/JSON files. Files are stored, metadata saved to the database, and the user can see a list of their uploaded datasets. No analysis yet — just reliable upload and storage.

## Demo Test ✅
> Login → click "Upload Dataset" → drag and drop a CSV → see progress bar → see the file listed in "My Datasets" with name, size, row count, and upload date.

---

## Backend Tasks

### 1. New Files
```
app/
├── models/
│   └── dataset.py          ← Dataset ORM model
├── schemas/
│   └── dataset.py          ← Upload/Response schemas
├── services/
│   └── dataset_service.py  ← upload, list, delete logic
└── api/v1/endpoints/
    └── datasets.py         ← upload, list, get, delete endpoints
```

### 2. Dataset Model
```sql
CREATE TABLE datasets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255),
    file_url TEXT,
    file_size BIGINT,
    total_rows INTEGER,
    total_columns INTEGER,
    status VARCHAR(50),   -- uploaded | profiling | ready | failed
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 3. Upload Endpoints
```
POST /api/v1/datasets/upload   → multipart form, save file, create record
GET  /api/v1/datasets          → list user's datasets
GET  /api/v1/datasets/{id}     → get single dataset
DELETE /api/v1/datasets/{id}   → delete dataset + file
PATCH /api/v1/datasets/{id}    → rename dataset
```

### 4. File Handling
- Validate: only `.csv`, `.xlsx`, `.json` accepted
- Validate: file not empty, not corrupted, under 100MB
- Dev: save to `./storage/datasets/{user_id}/{uuid}.csv`
- Prod: upload to Supabase Storage
- After saving: read file with Pandas to get `total_rows` and `total_columns`
- Save `file_url` and metadata to DB

---

## Frontend Tasks

### 1. New Pages/Components
```
src/
├── features/
│   └── datasets/
│       ├── UploadDataset.tsx     ← drag & drop upload zone
│       ├── DatasetList.tsx       ← grid/list of uploaded datasets
│       ├── DatasetCard.tsx       ← single dataset card
│       └── datasets.service.ts  ← API calls
└── app/
    └── (dashboard)/
        └── DatasetsPage.tsx
```

### 2. UI to Build
- **Upload Zone** — drag & drop area, click to select, shows file name after selection
- **Upload Progress** — progress bar while uploading
- **Success State** — checkmark animation + "View Dataset" button
- **Error State** — clear error message (file too large, wrong format, etc.)
- **Dataset List** — grid of cards showing name, rows, columns, size, date
- **Empty State** — "No datasets yet. Upload your first CSV."
- **Delete Confirmation** — modal before deleting

### 3. Sidebar Update
- Add "Datasets" link in sidebar navigation

---

## Phase 1 Checklist
- [ ] CSV upload works end-to-end
- [ ] XLSX upload works
- [ ] File too large (>100MB) shows clear error
- [ ] Wrong file type shows clear error
- [ ] Row count and column count shown on dataset card
- [ ] Dataset list shows all uploads for logged-in user
- [ ] Delete removes from list and storage
- [ ] Empty state shows when no datasets uploaded
- [ ] Upload progress bar animates during upload

---

---

# PHASE 2 — Data Profiling & Cleaning

## What You're Building
After upload, the system automatically analyzes the dataset and shows: row/column counts, missing values, duplicate records, outlier count, data types per column, a health score, and cleaning suggestions the user can apply.

## Demo Test ✅
> Upload `customer_data.csv` → wait 5 seconds → see "Dataset Health: 87/100" → see "2 issues found: Missing values in Age column, 3 duplicate rows" → click "Apply Suggested Fixes" → see health score jump to 98/100.

---

## Backend Tasks

### 1. New Files
```
app/
├── models/
│   ├── dataset_profile.py    ← profile results
│   └── dataset_column.py     ← per-column stats
├── schemas/
│   └── profile.py
├── services/
│   └── profiling_service.py  ← core profiling logic
├── tasks/
│   └── profiling_tasks.py    ← Celery background task
└── api/v1/endpoints/
    └── profile.py
```

### 2. Profiling Service Logic
```python
# profiling_service.py
def profile_dataset(file_path: str) -> dict:
    df = pd.read_csv(file_path)
    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "missing_values": df.isnull().sum().sum(),
        "duplicate_rows": df.duplicated().sum(),
        "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024**2,
        "health_score": calculate_health_score(df),
        "columns": [profile_column(df, col) for col in df.columns],
    }

def profile_column(df, col) -> dict:
    return {
        "name": col,
        "dtype": str(df[col].dtype),
        "null_count": df[col].isnull().sum(),
        "null_percentage": round(df[col].isnull().mean() * 100, 2),
        "unique_count": df[col].nunique(),
        "sample_values": df[col].dropna().head(5).tolist(),
        "statistics": df[col].describe().to_dict() if df[col].dtype != "object" else {},
    }

def calculate_health_score(df) -> float:
    # Penalise for missing values, duplicates, type issues
    score = 100
    missing_pct = df.isnull().mean().mean() * 100
    dup_pct = df.duplicated().mean() * 100
    score -= min(missing_pct * 2, 40)
    score -= min(dup_pct * 2, 20)
    return round(max(score, 0), 1)
```

### 3. Cleaning Endpoints
```
POST /api/v1/datasets/{id}/profile         → trigger profiling (async job)
GET  /api/v1/datasets/{id}/profile         → get profile results
GET  /api/v1/datasets/{id}/cleaning        → get cleaning suggestions
POST /api/v1/datasets/{id}/cleaning/apply  → apply selected fixes
```

### 4. Cleaning Logic
- Missing values: fill with `mean` / `median` / `mode` based on column type
- Duplicates: `df.drop_duplicates()`
- Save cleaned version as a separate file, update `cleaned_file_url` on dataset

### 5. Background Jobs
- Profiling runs as a Celery task (not blocking the API)
- Dataset `status` goes: `uploaded` → `profiling` → `ready`
- Frontend polls `GET /api/v1/jobs/{job_id}` for progress

---

## Frontend Tasks

### 1. Dataset Workspace Layout
This is the main screen users spend time on. Build the tab structure now:
```
Dataset Workspace
├── Tab: Overview      ← Phase 2
├── Tab: Cleaning      ← Phase 2
├── Tab: EDA           ← Phase 3
├── Tab: Dashboard     ← Phase 5
└── Tab: Reports       ← Phase 6
```

### 2. Overview Tab
- Dataset name + status badge
- 4 KPI cards: Rows, Columns, Missing Values, Duplicates
- Health Score ring (big circular progress, color coded green/yellow/red)
- Column table: name, type, null%, unique count, sample values

### 3. Cleaning Tab
- List of issues detected (e.g. "Age column: 12% missing values")
- Suggested fix per issue with dropdown to change strategy
- "Apply All Fixes" button
- Before/after health score preview
- Loading state while cleaning runs

### 4. Polling for Profiling Status
```typescript
// Poll every 2s until status = 'ready'
const { data } = useQuery({
  queryKey: ['dataset', id],
  queryFn: () => datasetService.get(id),
  refetchInterval: (data) => data?.status === 'ready' ? false : 2000,
})
```

---

## Phase 2 Checklist
- [ ] Profiling starts automatically after upload completes
- [ ] Health score shown with correct color (green >85, yellow 60–85, red <60)
- [ ] Missing value count correct for `customer_data.csv` (Age + City)
- [ ] Duplicate row count correct
- [ ] Per-column breakdown table visible
- [ ] Cleaning suggestions shown for each issue
- [ ] "Apply Fixes" updates the dataset and refreshes health score
- [ ] Loading skeleton shown while profiling is in progress
- [ ] Status badge updates (Uploading → Profiling → Ready)

---

---

# PHASE 3 — EDA & Visualizations

## What You're Building
After profiling, the EDA tab auto-generates charts and statistics: histograms for numerical columns, bar charts for categorical columns, a correlation heatmap, and a summary statistics table. All generated automatically with zero user configuration.

## Demo Test ✅
> Open `sales_data.csv` → click EDA tab → see 6+ charts auto-generated → see correlation heatmap → see summary statistics table → all loaded within 10 seconds.

---

## Backend Tasks

### 1. New Files
```
app/
├── services/
│   └── eda_service.py       ← chart + stats generation
├── tasks/
│   └── eda_tasks.py         ← Celery background task
└── api/v1/endpoints/
    └── eda.py
```

### 2. EDA Service Logic
```python
# eda_service.py
def generate_eda(df: pd.DataFrame) -> dict:
    charts = []
    numeric_cols = df.select_dtypes(include="number").columns
    categorical_cols = df.select_dtypes(include="object").columns

    # Histogram for each numeric column
    for col in numeric_cols[:6]:   # max 6
        fig = px.histogram(df, x=col, title=f"Distribution of {col}")
        charts.append({"type": "histogram", "column": col, "data": fig.to_json()})

    # Bar chart for each categorical column
    for col in categorical_cols[:4]:   # max 4
        counts = df[col].value_counts().head(10)
        fig = px.bar(counts, title=f"{col} Distribution")
        charts.append({"type": "bar", "column": col, "data": fig.to_json()})

    # Correlation heatmap
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr()
        fig = px.imshow(corr, title="Correlation Heatmap")
        charts.append({"type": "heatmap", "data": fig.to_json()})

    return {
        "charts": charts,
        "statistics": df.describe().to_dict(),
        "shape": {"rows": len(df), "columns": len(df.columns)},
    }
```

### 3. EDA Endpoints
```
POST /api/v1/datasets/{id}/eda     → trigger EDA (async job)
GET  /api/v1/datasets/{id}/eda     → get EDA results + charts
```

---

## Frontend Tasks

### 1. EDA Tab Components
```
src/features/eda/
├── EDATab.tsx                  ← main EDA tab container
├── ChartGrid.tsx               ← responsive grid of charts
├── ChartCard.tsx               ← single chart with title
├── CorrelationHeatmap.tsx      ← full-width heatmap
├── StatisticsTable.tsx         ← summary stats table
└── eda.service.ts
```

### 2. Chart Rendering
- Use **Recharts** for bar/line/pie charts
- Use **Plotly** (`react-plotly.js`) for heatmap (Plotly JSON directly from backend)
- Charts in a responsive 2-column grid on desktop, 1-column on mobile

### 3. Chart Types to Render
| Backend type | Frontend component |
|---|---|
| `histogram` | `<BarChart>` (Recharts) |
| `bar` | `<BarChart>` (Recharts) |
| `heatmap` | `<Plot>` (react-plotly.js) |
| `line` | `<LineChart>` (Recharts) |
| `scatter` | `<ScatterChart>` (Recharts) |

### 4. Statistics Table
- Show: mean, std, min, 25%, 50%, 75%, max for each numeric column
- Sortable by column name

---

## Phase 3 Checklist
- [ ] EDA triggers automatically after profiling completes
- [ ] Histogram shown for each numeric column (max 6)
- [ ] Bar chart shown for each categorical column (max 4)
- [ ] Correlation heatmap shown when 2+ numeric columns exist
- [ ] Summary statistics table shows all numeric columns
- [ ] Charts load within 10 seconds on `sales_data.csv`
- [ ] Charts are responsive (resize on mobile)
- [ ] Empty state if dataset has no numeric columns
- [ ] "Regenerate EDA" button works

---

---

# PHASE 4 — AI Chat

## What You're Building
A ChatGPT-like interface where the user can ask questions about their dataset in plain English and get answers with text, tables, and charts. This is the most impressive feature of the entire project.

## Demo Test ✅
> Open `sales_data.csv` → click Chat tab → type "Which product generates the most revenue?" → see a text answer + bar chart appear in the chat → type "Compare sales by region" → see a comparison chart → type "What are the top 3 customers?" → see a table.

---

## Backend Tasks

### 1. New Files
```
app/
├── agents/
│   └── chat_agent.py        ← LangChain + Groq chat agent
├── services/
│   └── chat_service.py      ← session management, history
├── models/
│   ├── chat_session.py
│   └── chat_message.py
├── schemas/
│   └── chat.py
└── api/v1/endpoints/
    └── chat.py
```

### 2. Chat Agent (Core)
```python
# chat_agent.py
from langchain_groq import ChatGroq
from langchain_experimental.agents import create_pandas_dataframe_agent

def get_chat_agent(df: pd.DataFrame):
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.1,
    )
    agent = create_pandas_dataframe_agent(
        llm,
        df,
        verbose=True,
        agent_type="tool-calling",
        allow_dangerous_code=True,
    )
    return agent

async def answer_question(dataset_id: str, question: str) -> dict:
    df = load_dataset(dataset_id)
    agent = get_chat_agent(df)
    result = agent.invoke(question)
    return {
        "answer": result["output"],
        "chart": extract_chart_if_present(result),
        "table": extract_table_if_present(result),
    }
```

### 3. Chat Endpoints
```
POST /api/v1/chat/query              → send message, get response
GET  /api/v1/chat/history/{session}  → get message history
DELETE /api/v1/chat/{session}        → delete session
```

### 4. Chat Message Schema
```json
{
  "dataset_id": "uuid",
  "session_id": "uuid",
  "message": "Which product generates the most revenue?"
}
```

Response:
```json
{
  "answer": "Product A generated the most revenue at $142,500.",
  "chart": { "type": "bar", "data": {...} },
  "table": null,
  "follow_up_suggestions": ["Which region sold most of Product A?"]
}
```

---

## Frontend Tasks

### 1. Chat Components
```
src/features/chat/
├── ChatPage.tsx              ← full chat interface
├── ChatInput.tsx             ← text input + send button
├── MessageBubble.tsx         ← user + AI message styling
├── MessageChart.tsx          ← renders chart inside message
├── MessageTable.tsx          ← renders table inside message
├── SuggestedPrompts.tsx      ← clickable prompt chips
└── chat.service.ts
```

### 2. UI to Build
- **Chat window** — scrollable message history
- **User messages** — right-aligned, accent color background
- **AI messages** — left-aligned, card background, can contain text + chart + table
- **Typing indicator** — "AnalyticaAI is thinking..." with animated dots
- **Suggested prompts** — 4 chips shown when chat is empty (clickable)
- **Chat input** — textarea, send on Enter, Shift+Enter for newline
- **Context header** — shows dataset name at top of chat

### 3. Suggested Prompts (shown when no messages)
```
"Which product generates the most revenue?"
"Show me the top 10 customers"
"What trends do you see in this data?"
"Are there any anomalies or outliers?"
```

### 4. Error Handling
- If AI fails → show "I couldn't answer that. Try rephrasing." in the message bubble
- Never crash — always show a graceful error message

---

## Phase 4 Checklist
- [ ] User can type a question and receive a text answer
- [ ] Answer appears within 5 seconds for simple queries
- [ ] Bar chart renders inside the AI message for aggregation questions
- [ ] Table renders inside the AI message for list questions
- [ ] Suggested prompts shown on empty chat
- [ ] Clicking a suggested prompt sends it automatically
- [ ] Chat history persists across page refreshes
- [ ] Typing indicator shows while AI is responding
- [ ] "I couldn't answer that" shown gracefully on AI error
- [ ] Multiple follow-up questions work in the same session

---

---

# PHASE 5 — Dashboard Generation

## What You're Building
A one-click auto-generated dashboard with KPI cards, charts, and a data table — all chosen and laid out automatically based on the dataset. The user can also remove or resize widgets.

## Demo Test ✅
> Open `sales_data.csv` → click Dashboard tab → click "Generate Dashboard" → wait 5 seconds → see 3 KPI cards (Total Revenue, Total Orders, Top Product) + 3 charts (Revenue by Region bar, Sales Trend line, Category Pie) + a data table → looks like a real BI dashboard.

---

## Backend Tasks

### 1. New Files
```
app/
├── agents/
│   └── dashboard_agent.py    ← decides which widgets to create
├── services/
│   └── dashboard_service.py  ← builds widget configs
├── models/
│   ├── dashboard.py
│   └── dashboard_widget.py
└── api/v1/endpoints/
    └── dashboards.py
```

### 2. Dashboard Agent Logic
```python
# dashboard_agent.py — uses LLM to pick best widgets for the dataset
DASHBOARD_PROMPT = """
You are a BI dashboard designer. Given this dataset profile:
{profile}

Return a JSON dashboard config with widgets.
Start with 3 KPI cards, then 2-3 charts, then a data table.
Pick the most business-relevant metrics.

Return ONLY valid JSON, no explanation.
"""

def generate_dashboard_config(profile: dict, df: pd.DataFrame) -> dict:
    llm = get_llm()
    response = llm.invoke(DASHBOARD_PROMPT.format(profile=json.dumps(profile)))
    config = json.loads(response.content)
    # Add actual data to each widget
    return enrich_widgets_with_data(config, df)
```

### 3. Dashboard Endpoints
```
POST /api/v1/datasets/{id}/dashboard    → generate dashboard
GET  /api/v1/dashboards/{id}            → get dashboard + widget data
PATCH /api/v1/dashboards/{id}           → update layout
DELETE /api/v1/dashboards/{id}          → delete dashboard
```

### 4. Widget Schema
```json
{
  "widgets": [
    {
      "id": "uuid",
      "type": "kpi_card",
      "title": "Total Revenue",
      "value": "$142,500",
      "change": "+12%",
      "position": { "x": 0, "y": 0 },
      "size": { "w": 4, "h": 1 }
    },
    {
      "id": "uuid",
      "type": "bar_chart",
      "title": "Revenue by Region",
      "data": [...],
      "position": { "x": 0, "y": 1 },
      "size": { "w": 8, "h": 3 }
    }
  ]
}
```

---

## Frontend Tasks

### 1. Dashboard Components
```
src/features/dashboard/
├── DashboardTab.tsx           ← main dashboard tab
├── GenerateDashboard.tsx      ← empty state + generate button
├── DashboardGrid.tsx          ← responsive widget grid
├── widgets/
│   ├── KPICard.tsx            ← metric + trend arrow
│   ├── BarChartWidget.tsx
│   ├── LineChartWidget.tsx
│   ├── PieChartWidget.tsx
│   └── DataTableWidget.tsx
└── dashboard.service.ts
```

### 2. KPI Card
```
┌────────────────────┐
│ Total Revenue      │
│ $142,500           │
│ ▲ +12% vs last     │
└────────────────────┘
```
- Large number, colored trend arrow (green ▲ / red ▼)
- Icon on the right

### 3. Dashboard Layout
- Use CSS Grid with 12 columns
- KPI cards: 4 cols wide, 1 row tall (3 cards side by side)
- Charts: 6 or 12 cols wide, 3 rows tall
- Data table: 12 cols wide, 4 rows tall

### 4. Interactions
- "Generate Dashboard" button → loading state → dashboard appears
- "×" button on each widget → remove it
- "Regenerate" button → rebuilds the whole dashboard

---

## Phase 5 Checklist
- [ ] "Generate Dashboard" button triggers generation
- [ ] 3 KPI cards appear with real values from the dataset
- [ ] At least 2 charts appear automatically
- [ ] Data table appears at the bottom
- [ ] Removing a widget works
- [ ] Dashboard looks like a real BI tool (not plain HTML)
- [ ] Loading skeleton shown while generating
- [ ] Empty state shown before generation with clear CTA

---

---

# PHASE 6 — Insights & Reports

## What You're Building
The AI automatically detects trends, risks, and opportunities in the data and presents them as insight cards. The user can then generate a professional PDF or DOCX report that includes all charts, insights, and a written executive summary.

## Demo Test ✅
> Open `sales_data.csv` → click "Generate Insights" → see 4 insight cards (e.g. "Revenue up 18% — North region driving growth", "Risk: Electronics declining") → click "Export Report" → choose PDF → download opens a professional 4-page PDF with charts and written analysis.

---

## Backend Tasks

### 1. New Files
```
app/
├── agents/
│   └── insight_agent.py      ← LLM-powered insight generation
├── services/
│   ├── insight_service.py
│   └── report_service.py     ← PDF + DOCX generation
├── models/
│   ├── insight.py
│   └── report.py
└── api/v1/endpoints/
    ├── insights.py
    └── reports.py
```

### 2. Insight Agent
```python
INSIGHT_PROMPT = """
You are a senior business analyst. Analyze this dataset summary and generate insights.

Dataset: {dataset_name}
Statistics: {statistics}
Top values: {top_values}

Generate 4-6 business insights. Each must be:
- Backed by specific numbers from the data
- Written in plain English (no jargon)
- Categorized as: trend | risk | opportunity | recommendation

Return JSON:
{{
  "insights": [
    {{
      "type": "trend",
      "title": "Short title",
      "description": "One sentence with specific numbers.",
      "severity": "high | medium | low"
    }}
  ],
  "executive_summary": "2-3 sentence overall summary."
}}
"""
```

### 3. Report Generation (PDF)
```python
# report_service.py
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Image, Table

def generate_pdf_report(dataset, profile, insights, charts) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []

    # Cover page
    story.append(Paragraph(f"Analytics Report: {dataset.name}", title_style))
    story.append(Paragraph(f"Generated on {date.today()}", subtitle_style))

    # Executive Summary
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(insights["executive_summary"], body_style))

    # Dataset Overview
    story.append(Paragraph("Dataset Overview", heading_style))
    story.append(build_overview_table(profile))

    # Key Insights
    story.append(Paragraph("Key Insights", heading_style))
    for insight in insights["insights"]:
        story.append(build_insight_block(insight))

    # Charts
    story.append(Paragraph("Visualizations", heading_style))
    for chart in charts[:4]:   # max 4 charts in report
        story.append(Image(chart_to_image(chart), width=400, height=250))

    doc.build(story)
    return buffer.getvalue()
```

### 4. Endpoints
```
POST /api/v1/datasets/{id}/insights        → generate insights
GET  /api/v1/datasets/{id}/insights        → get insights
POST /api/v1/reports/generate              → generate report
GET  /api/v1/reports/{id}/pdf              → download PDF
GET  /api/v1/reports/{id}/docx             → download DOCX
```

---

## Frontend Tasks

### 1. Insights Components
```
src/features/insights/
├── InsightsTab.tsx
├── InsightCard.tsx            ← colored card per insight type
└── insights.service.ts
```

### 2. Insight Card Design
```
┌─────────────────────────────────────┐
│ 📈 TREND                            │  ← colored by type
│ Revenue Up 18% in North Region      │  ← bold title
│ North region grew from $89K to      │  ← description
│ $105K, outperforming all others.    │
└─────────────────────────────────────┘
```
- `trend` → blue border
- `risk` → red border
- `opportunity` → green border
- `recommendation` → purple border

### 3. Reports Page
```
src/features/reports/
├── ReportsPage.tsx
├── ReportCard.tsx             ← shows report name + download buttons
├── GenerateReportModal.tsx    ← choose report type
└── reports.service.ts
```

### 4. Export Flow
- "Export Report" button → modal → choose "Executive PDF" or "Technical DOCX"
- Loading state: "Generating your report..."
- On complete: auto-download starts + success toast
- Report listed in Reports page with date + download buttons

---

## Phase 6 Checklist
- [ ] Insight generation produces 4+ insights for `sales_data.csv`
- [ ] Each insight has a type badge (trend/risk/opportunity/recommendation)
- [ ] Insights contain specific numbers (not generic statements)
- [ ] "Export PDF" downloads a real formatted PDF
- [ ] PDF contains: title page, summary, overview table, insights, at least 2 charts
- [ ] "Export DOCX" downloads a real formatted Word document
- [ ] Reports listed in Reports page with download buttons
- [ ] Loading state shown during report generation

---

---

# PHASE 7 — Polish & Deploy

## What You're Building
Production-ready application with proper error handling, loading states, empty states, mobile responsiveness, and a live public URL.

## Demo Test ✅
> Share the live URL with someone who has never seen the project → they can register, upload a CSV, see the dashboard, chat with the data, and download a report without any help from you.

---

## Frontend Polish

### 1. Empty States (every page needs one)
- No datasets → "Upload your first dataset"
- No chat history → "Ask anything about your data"
- No dashboard → "Click Generate Dashboard"
- No reports → "No reports yet"

### 2. Loading States (every async action)
- Page skeleton loaders (not just spinners)
- Button disabled + spinner while submitting
- Progress indicator for long operations (profiling, report generation)

### 3. Error States
- Network error toast: "Connection lost. Retrying..."
- AI error: "Couldn't process that. Try rephrasing."
- Upload error: clear message + retry button

### 4. Mobile Responsive
- Sidebar collapses to bottom nav on mobile
- Charts stack to single column on mobile
- Upload zone works on mobile (tap to select)
- Chat interface full-screen on mobile

### 5. Dark Mode
- Toggle in navbar
- Persist preference in localStorage
- All components respect `dark:` Tailwind classes

---

## Backend Polish

### 1. Error Handling
- All endpoints return structured errors (see `error-codes.md`)
- Never return 500 with a raw Python traceback
- Log all errors to console (structured JSON logging)

### 2. Rate Limiting
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/chat/query")
@limiter.limit("20/minute")
async def chat_query(...): ...
```

### 3. Health & Monitoring
- `GET /health` checks DB + Redis + storage connections
- Sentry error tracking configured
- Request logging middleware

---

## Deployment Checklist

### Backend → Render
- [ ] `Dockerfile` builds successfully
- [ ] All env vars set in Render dashboard
- [ ] `alembic upgrade head` run after first deploy
- [ ] `GET /health` returns 200 on live URL

### Frontend → Vercel
- [ ] Build succeeds (`npm run build`)
- [ ] `VITE_API_URL` set to Render backend URL in Vercel env vars
- [ ] All routes work on refresh (Vercel `rewrites` configured for SPA)

### Database → Neon
- [ ] Connection string in Render env vars
- [ ] Tables created via migrations
- [ ] Can register + login on live site

### Storage → Supabase
- [ ] Bucket `analytica-ai` created (public)
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] File upload works on live site

---

## Final Launch Checklist
- [ ] Register on live site → works
- [ ] Upload `sales_data.csv` → works
- [ ] Profiling completes → health score visible
- [ ] EDA charts load → visible
- [ ] Chat: "Which product has most revenue?" → correct answer
- [ ] Dashboard generates → 3+ widgets visible
- [ ] Insight cards appear → 4+ insights
- [ ] PDF download works → real formatted PDF
- [ ] Mobile layout looks good on phone
- [ ] No console errors on any page
- [ ] README has live demo URL + screenshots

---

---

# Quick Reference

## Build Order
```
Phase 0 → Auth works
    ↓
Phase 1 → Upload works
    ↓
Phase 2 → Profiling works
    ↓
Phase 3 → Charts work
    ↓
Phase 4 → AI Chat works        ← most impressive, do not skip
    ↓
Phase 5 → Dashboard works
    ↓
Phase 6 → Reports work
    ↓
Phase 7 → Live URL works
```

## Rule: Never Skip Ahead
If Phase 2 profiling doesn't work reliably, Phase 4 AI Chat will be broken.
Each phase depends on the previous one. Fix before moving forward.

## Rule: Test With Real Data
Use `sample-datasets/sales_data.csv` and `customer_data.csv` for every test.
These files have intentional edge cases (missing values, multiple data types).

## Branch Strategy
```
main        ← only working, tested code
develop     ← active development
feature/*   ← one branch per phase feature
```

Never push broken code to `main`.
Each phase completion = one PR from `develop` → `main`.

## V2 Features (After MVP is Live)
- Forecasting (Prophet + XGBoost)
- AutoML (scikit-learn pipeline)
- Anomaly Detection (Isolation Forest)
- RAG Memory (ChromaDB)
- Multi-agent orchestration (LangGraph)
