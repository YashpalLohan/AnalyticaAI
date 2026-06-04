# 02-TRD.md

# Technical Requirements Document

## AI Data Analyst Agent

Version: 1.0

---

# 1. Document Purpose

This document defines the technical architecture, system requirements, engineering decisions, infrastructure, APIs, AI pipelines, databases, and deployment strategy for the AI Data Analyst Agent platform.

---

# 2. System Overview

AI Data Analyst Agent is an Agentic AI platform that enables users to:

* Upload datasets
* Clean data
* Perform EDA
* Generate dashboards
* Chat with datasets
* Train ML models
* Forecast future values
* Generate reports

The platform combines:

* Full-stack SaaS architecture
* Multi-agent AI system
* AutoML pipelines
* Retrieval-Augmented Generation (RAG)
* Analytics engine

---

# 3. High-Level Architecture

```text
Frontend (React.js)
        │
        ▼
API Gateway
        │
        ▼
FastAPI Backend
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
AI     ML     Data
Layer  Layer  Layer
 │      │      │
 ▼      ▼      ▼
LangGraph
Scikit-learn
PostgreSQL
        │
        ▼
Vector Database
(ChromaDB)
```

---

# 4. Technology Stack

## Frontend

### Framework

* React.js 18
* TypeScript
* Vite

### Styling

* Tailwind CSS
* Shadcn UI

### Charts

* Recharts
* Plotly

### State Management

* Zustand

### Forms

* React Hook Form
* Zod

---

## Backend

### Framework

* FastAPI

### Language

* Python 3.12

### Server

* Uvicorn

### Background Jobs

* Celery

### Queue

* Redis

---

## Database

### Relational Database

* PostgreSQL

Purpose:

* User data
* Dataset metadata
* Reports
* Models

---

### Vector Database

* ChromaDB

Purpose:

* Dataset embeddings
* Chat memory
* RAG retrieval

---

## File Storage

### Production

* Supabase Storage (free tier: 1GB)

### Development

* Local Storage

---

# 5. Frontend Architecture

```text
src/
│
├── app/
├── components/
├── features/
├── services/
├── hooks/
├── store/
├── types/
└── utils/
```

---

## Feature Structure

```text
features/
│
├── auth/
├── datasets/
├── dashboards/
├── chat/
├── reports/
├── forecasting/
└── automl/
```

---

# 6. Backend Architecture

```text
backend/
│
├── api/
├── services/
├── agents/
├── ml/
├── database/
├── schemas/
├── tasks/
└── utils/
```

---

# 7. Authentication Requirements

## MVP

JWT Authentication

### Endpoints

```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
```

---

## Security

Password Hashing:

```python
bcrypt
```

---

Token Expiry:

```text
15 minutes access token
7 days refresh token
```

---

# 8. Dataset Processing Pipeline

## Upload Flow

```text
Upload
 ↓
Validation
 ↓
Storage
 ↓
Schema Detection
 ↓
Profiling
 ↓
Cleaning
 ↓
EDA
```

---

## Supported Formats

### CSV

Pandas

### XLSX

OpenPyXL

### JSON

Native JSON Parser

---

## File Limits

```text
MVP = 100 MB

V2 = 500 MB

V3 = 2 GB
```

---

# 9. Data Profiling Engine

## Libraries

```python
pandas
numpy
ydata-profiling
```

---

## Generated Metrics

### Dataset Metrics

* Row Count
* Column Count
* Memory Usage

### Quality Metrics

* Missing Values
* Duplicates
* Outliers

### Statistical Metrics

* Mean
* Median
* Std Dev
* Variance

---

# 10. Data Cleaning Engine

## Missing Value Strategies

### Numerical

* Mean
* Median

### Categorical

* Mode

---

## Duplicate Removal

```python
drop_duplicates()
```

---

## Outlier Detection

### Algorithms

* IQR
* Z-score

---

# 11. Visualization Engine

## Libraries

```python
plotly
matplotlib
seaborn
```

---

## Supported Charts

* Bar Chart
* Pie Chart
* Histogram
* Heatmap
* Scatter Plot
* Line Chart
* Area Chart

---

# 12. AI Layer

## Framework

LangGraph

---

## LLM Provider

### Development

Groq API (llama-3.3-70b-versatile, 128k context)

### Fast / Routing Tasks

Groq API (llama-3.1-8b-instant)

### Future

* Anthropic
* Gemini
* Local LLMs via Ollama

---

## Responsibilities

* Query understanding
* Insight generation
* Report writing
* Tool selection

---

# 13. Agent Architecture

## Dataset Understanding Agent

Purpose:

Understand schema.

Inputs:

Dataset metadata.

Outputs:

Dataset context.

---

## Cleaning Agent

Purpose:

Recommend fixes.

Outputs:

Cleaning plan.

---

## EDA Agent

Purpose:

Generate analytics.

Outputs:

Visualizations.

---

## Insight Agent

Purpose:

Generate business insights.

Outputs:

Recommendations.

---

## ML Agent

Purpose:

Train predictive models.

Outputs:

Predictions.

---

## Report Agent

Purpose:

Generate reports.

Outputs:

PDF/DOCX reports.

---

# 14. LangGraph Workflow

```text
Dataset Upload
      ↓
Schema Agent
      ↓
Cleaning Agent
      ↓
EDA Agent
      ↓
Insight Agent
      ↓
ML Agent
      ↓
Report Agent
```

---

# 15. RAG Architecture

## Embedding Model

```text
nomic-embed-text
```

> Note: Groq does not provide an embeddings API. Embeddings are handled
> separately using nomic-embed-text via Ollama (local/dev) or Nomic API (production).

---

## Stored Context

* Dataset summaries
* Chat history
* Reports
* Insights

---

## Retrieval Flow

```text
Question
    ↓
Embedding
    ↓
Vector Search
    ↓
Context Retrieval
    ↓
LLM
```

---

# 16. Chat Engine

## Flow

```text
User Query
      ↓
Intent Detection
      ↓
Tool Selection
      ↓
Data Query
      ↓
LLM Response
```

---

## Supported Queries

### Data Analysis

Show top products.

### Forecasting

Predict future sales.

### Insight Requests

Why did revenue decline?

---

# 17. AutoML Engine

## Libraries

```python
scikit-learn
xgboost
lightgbm
```

---

## Problem Detection

### Classification

Examples:

* Churn
* Fraud

---

### Regression

Examples:

* Revenue Prediction

---

### Forecasting

Examples:

* Demand Forecast

---

# 18. Model Training Pipeline

```text
Dataset
    ↓
Feature Engineering
    ↓
Train/Test Split
    ↓
Model Training
    ↓
Evaluation
    ↓
Selection
```

---

## Evaluation Metrics

### Classification

* Accuracy
* Precision
* Recall
* F1

### Regression

* RMSE
* MAE
* R²

### Forecasting

* MAPE
* RMSE

---

# 19. Forecasting Engine

## Models

### MVP

* Prophet

### V2

* XGBoost

### V3

* LSTM

---

## Outputs

* Forecast Values
* Confidence Bands
* Trend Analysis

---

# 20. Anomaly Detection

## Algorithms

### MVP

* Isolation Forest

### V2

* DBSCAN

### V3

* Local Outlier Factor

---

## Output

```json
{
  "record_id": 123,
  "anomaly_score": 0.92,
  "severity": "high"
}
```

---

# 21. Report Generation

## PDF Engine

```python
reportlab
```

---

## DOCX Engine

```python
python-docx
```

---

## Sections

* Executive Summary
* Dataset Overview
* Visualizations
* Forecasts
* Recommendations

---

# 22. API Requirements

## Dataset APIs

```http
POST /datasets/upload
GET /datasets
GET /datasets/{id}
DELETE /datasets/{id}
```

---

## Chat APIs

```http
POST /chat/query
GET /chat/history
```

---

## Forecast APIs

```http
POST /forecast/generate
```

---

## Report APIs

```http
POST /report/create
GET /report/download
```

---

# 23. Background Jobs

Handled by:

```text
Celery + Redis
```

---

Tasks:

* Dataset profiling
* Dashboard generation
* Forecasting
* AutoML training
* Report creation

---

# 24. Security Requirements

## Authentication

JWT

---

## Encryption

TLS 1.3

---

## Storage

Encrypted files

---

## Rate Limiting

```text
100 requests/minute
```

---

# 25. Performance Requirements

| Feature    | Target  |
| ---------- | ------- |
| Upload     | <10 sec |
| Dashboard  | <30 sec |
| Chat Query | <5 sec  |
| Forecast   | <60 sec |
| Report     | <20 sec |

---

# 26. Monitoring

## Logging

* Application Logs
* Agent Logs
* Error Logs

---

## Monitoring Tools

* Prometheus
* Grafana

---

## Error Tracking

* Sentry

---

# 27. Deployment Architecture

```text
Vercel
   │
   ▼
React.js Frontend

Render / Fly.io
   │
   ▼
FastAPI Backend

Supabase Storage
   │
   ▼
Storage

PostgreSQL
   │
   ▼
Database

ChromaDB
   │
   ▼
Vector Store
```

---

# 28. CI/CD Pipeline

```text
GitHub
    ↓
GitHub Actions
    ↓
Testing
    ↓
Build
    ↓
Deploy
```

---

# 29. MVP Engineering Scope

Included:

* Authentication
* Dataset Upload
* Profiling
* Cleaning
* EDA
* Dashboard
* Chat
* Reports

Excluded:

* Multi-tenant workspaces
* Real-time analytics
* Collaboration

---

# 30. Future Scalability

V2

* AutoML
* Forecasting
* Advanced Agents

---

V3

* Multi-agent orchestration
* Enterprise features
* Team collaboration
* Streaming analytics

---

# Technical Completion Criteria

The system shall:

* Support 100MB datasets
* Generate dashboards automatically
* Answer natural language queries
* Produce AI-generated insights
* Train ML models automatically
* Generate downloadable reports
* Maintain response latency within defined targets
* Support future multi-agent expansion