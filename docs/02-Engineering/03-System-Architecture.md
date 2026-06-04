# 03-System-Architecture.md

# AI Data Analyst Agent

## System Architecture Document

Version: 1.0

---

# 1. Purpose

This document defines the complete architecture of the AI Data Analyst Agent platform.

It describes:

* System components
* Service interactions
* AI architecture
* Data architecture
* Infrastructure design
* Scalability strategy
* Security architecture
* Deployment architecture

---

# 2. Architecture Goals

The architecture must:

### Goal 1

Support non-technical users.

---

### Goal 2

Handle large datasets efficiently.

---

### Goal 3

Enable multi-agent AI workflows.

---

### Goal 4

Support AutoML and forecasting.

---

### Goal 5

Scale from MVP to SaaS production.

---

# 3. High-Level Architecture

```text
┌──────────────────────────┐
│        Frontend          │
│      React.js App         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      API Gateway         │
│       FastAPI            │
└────────────┬─────────────┘
             │
 ┌───────────┼───────────┐
 ▼           ▼           ▼

AI Layer   ML Layer   Data Layer

 ▼           ▼           ▼

LangGraph  AutoML    PostgreSQL

 ▼           ▼           ▼

Groq      Models     ChromaDB

             ▼

          Reports
```

---

# 4. Architectural Layers

The system is divided into six layers.

```text
Presentation Layer
Business Layer
AI Layer
ML Layer
Data Layer
Infrastructure Layer
```

---

# 5. Presentation Layer

## Responsibilities

* User Interface
* Dashboard Rendering
* Visualization Display
* Chat Experience
* Dataset Management

---

## Technology

```text
React.js
Vite
TypeScript
Tailwind CSS
Shadcn UI
```

---

## Components

### Authentication UI

Login

Registration

Password Reset

---

### Dataset UI

Upload

Dataset Workspace

Dataset History

---

### Dashboard UI

Charts

KPIs

Widgets

---

### Chat UI

Conversation Window

Suggested Prompts

Results Display

---

# 6. API Layer

## Purpose

Acts as the entry point for all requests.

---

## Technology

```text
FastAPI
```

---

## Responsibilities

### Authentication

### Dataset Upload

### Agent Execution

### Forecast Requests

### Report Requests

### Dashboard Requests

---

## Example Flow

```text
Frontend
     ↓
FastAPI
     ↓
Business Service
     ↓
Agent System
```

---

# 7. Business Logic Layer

## Purpose

Contains application rules.

---

## Services

### User Service

Authentication

Permissions

---

### Dataset Service

Upload

Versioning

Storage

---

### Chat Service

Query Processing

Conversation Storage

---

### Report Service

Report Generation

Exports

---

### Forecast Service

Prediction Management

---

# 8. AI Layer

The AI Layer powers intelligent analytics.

---

## Technology

```text
LangGraph
LangChain
Groq (Llama 3.3)
```

---

## Responsibilities

### Dataset Understanding

### Query Interpretation

### Insight Generation

### Report Writing

### Agent Coordination

---

# 9. Agent Architecture

The system uses multiple specialized agents.

---

## Agent 1

Dataset Understanding Agent

### Responsibilities

* Schema Analysis
* Metadata Extraction
* Dataset Context Creation

---

## Agent 2

Cleaning Agent

### Responsibilities

* Missing Values
* Duplicate Detection
* Outlier Detection

---

## Agent 3

EDA Agent

### Responsibilities

* Statistics
* Correlations
* Visualizations

---

## Agent 4

Insight Agent

### Responsibilities

* Business Trends
* Risks
* Recommendations

---

## Agent 5

ML Agent

### Responsibilities

* Model Selection
* Model Training
* Evaluation

---

## Agent 6

Forecast Agent

### Responsibilities

* Future Predictions
* Confidence Intervals

---

## Agent 7

Report Agent

### Responsibilities

* Executive Reports
* Technical Reports

---

# 10. Agent Communication Flow

```text
Dataset Upload
      ↓
Dataset Agent
      ↓
Cleaning Agent
      ↓
EDA Agent
      ↓
Insight Agent
      ↓
ML Agent
      ↓
Forecast Agent
      ↓
Report Agent
```

---

# 11. LangGraph Workflow

```text
START
  ↓
Dataset Analysis
  ↓
Cleaning
  ↓
EDA
  ↓
Insight Generation
  ↓
Decision Node
 ├── Forecast
 ├── AutoML
 └── Report
  ↓
END
```

---

# 12. Data Layer

Stores all structured information.

---

## Components

### PostgreSQL

Relational data.

### ChromaDB

Vector embeddings.

### S3 Storage

Dataset files.

---

# 13. Database Architecture

```text
Users
 │
 ├── Datasets
 │      │
 │      ├── Reports
 │      ├── Forecasts
 │      ├── Models
 │      └── Chats
```

---

# 14. Dataset Storage Architecture

## Original Dataset

Stored unchanged.

---

## Clean Dataset

Stored separately.

---

## Processed Dataset

Used for analysis.

---

```text
Original
    ↓
Cleaned
    ↓
Analyzed
```

---

# 15. RAG Architecture

## Purpose

Provide memory.

---

## Stored Knowledge

### Dataset Metadata

### Previous Queries

### Insights

### Reports

### Forecasts

---

## Retrieval Flow

```text
User Question
      ↓
Embedding
      ↓
Vector Search
      ↓
Relevant Context
      ↓
LLM
      ↓
Answer
```

---

# 16. ML Architecture

## Purpose

Provide predictive analytics.

---

## AutoML Engine

Automatically detects:

* Classification
* Regression
* Forecasting

---

## Training Pipeline

```text
Dataset
      ↓
Feature Engineering
      ↓
Model Candidates
      ↓
Training
      ↓
Evaluation
      ↓
Best Model
```

---

# 17. Forecasting Architecture

## Inputs

Historical Data

---

## Models

MVP

```text
Prophet
```

---

V2

```text
XGBoost
```

---

V3

```text
LSTM
```

---

## Outputs

* Predictions
* Trend Analysis
* Confidence Intervals

---

# 18. Anomaly Detection Architecture

## Purpose

Identify unusual behavior.

---

## Algorithms

### Isolation Forest

MVP

### DBSCAN

V2

### Local Outlier Factor

V3

---

## Flow

```text
Dataset
      ↓
Anomaly Engine
      ↓
Scores
      ↓
Explanation
```

---

# 19. Dashboard Architecture

## Dashboard Generator

Uses:

* Dataset profile
* Business metrics
* User goals

---

## Components

```text
KPI Cards
Charts
Tables
Filters
Forecast Widgets
```

---

## Rendering Engine

Frontend receives dashboard schema.

```json
{
  "widgets": [],
  "layout": []
}
```

---

Frontend renders dynamically.

---

# 20. Report Generation Architecture

## Input Sources

* Dataset
* Insights
* Forecasts
* Models

---

## Pipeline

```text
Data
 ↓
Insights
 ↓
Charts
 ↓
Report Builder
 ↓
PDF/DOCX
```

---

# 21. Background Job Architecture

Heavy operations run asynchronously.

---

## Queue System

```text
Redis
```

---

## Workers

```text
Celery Workers
```

---

## Tasks

### Profiling

### EDA

### Forecasting

### AutoML

### Report Generation

---

# 22. Security Architecture

## Authentication

JWT

---

## Authorization

Role-based access.

---

## Encryption

### Data In Transit

TLS 1.3

### Data At Rest

AES-256

---

## Secrets

Managed through:

```text
Environment Variables
```

---

# 23. Logging Architecture

## Logs

### Application Logs

### Agent Logs

### API Logs

### Error Logs

---

## Stack

```text
Python Logging
Sentry
```

---

# 24. Monitoring Architecture

## Metrics

CPU

Memory

Latency

Errors

---

## Tools

```text
Prometheus
Grafana
```

---

# 25. Deployment Architecture

## Frontend

```text
Vercel
```

---

## Backend

```text
Render
Fly.io
```

---

## Database

```text
PostgreSQL
```

---

## Storage

```text
Supabase Storage (free tier: 1GB)
```

---

## Vector Database

```text
ChromaDB
```

---

# 26. Scalability Strategy

## MVP

Single backend instance.

---

## V2

Multiple workers.

---

## V3

Microservices.

---

```text
Frontend
     ↓
Load Balancer
     ↓
API Cluster
     ↓
Worker Cluster
     ↓
Database Cluster
```

---

# 27. Fault Tolerance

## Retry Mechanisms

Agent failures retried automatically.

---

## Backup Strategy

Daily database backups.

---

## Disaster Recovery

Restore within 1 hour.

---

# 28. Architecture Decision Records

## Decision 1

FastAPI over Django.

Reason:

Better AI ecosystem integration.

---

## Decision 2

LangGraph over custom orchestration.

Reason:

Supports agent workflows.

---

## Decision 3

PostgreSQL over MongoDB.

Reason:

Strong relational data requirements.

---

## Decision 4

ChromaDB for MVP.

Reason:

Simple vector database deployment.

---

# 29. Future Architecture

### Multi-Tenant SaaS

### Enterprise Workspaces

### Team Collaboration

### Real-Time Streaming Analytics

### Local LLM Support

### Multi-Cloud Deployment

---

# Final Architecture Summary

```text
React.js Frontend
        ↓
FastAPI API Layer
        ↓
Business Services
        ↓
LangGraph Agents
        ↓
AutoML + Forecasting
        ↓
PostgreSQL + ChromaDB
        ↓
Supabase Storage
        ↓
Reports + Dashboards + Chat
```

The architecture is designed to support an AI-first analytics platform capable of evolving from an MVP into a scalable enterprise-grade SaaS product.
