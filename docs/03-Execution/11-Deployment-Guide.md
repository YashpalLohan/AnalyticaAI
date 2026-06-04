# 11-Deployment-Guide.md

# AI Data Analyst Agent

## Deployment Guide

Version: 1.0

---

# 1. Purpose

This document explains how to deploy the AI Data Analyst Agent from local development to production.

It covers:

* Local Setup
* Development Environment
* Staging Environment
* Production Deployment
* CI/CD
* Monitoring
* Backup Strategy
* Scaling

---

# 2. Deployment Architecture

```text id="j4wdwz"
                 Users
                   │
                   ▼
            Vercel Frontend
          (free — personal projects)
                   │
                   ▼
             Render Backend
           (free — 750 hrs/month)
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼

 Neon DB       Upstash       ChromaDB
(PostgreSQL)   (Redis)      (self-hosted)
 free 0.5GB   free 10K/day

      ▼
 Supabase Storage
  (free — 1GB)
```

---

# 3. Infrastructure Stack

## Frontend

Recommended:

```text id="9lzg6t"
Vercel
```

Free for personal/portfolio projects. No credit card required.

---

## Backend

Recommended:

```text id="2pkztj"
Render
```

Free tier: 750 hours/month (enough for 1 always-on service).
Note: Free tier spins down after 15 min of inactivity (cold start ~30s).

---

## Database

Recommended:

```text id="9rjl5y"
Neon (PostgreSQL)
```

Free tier: 0.5GB storage, 1 project, no credit card required.

Provider:

```text id="8s42ia"
https://neon.tech
```

Alternative: Supabase (500MB free)

---

## Object Storage

Recommended:

```text id="72ojt6"
Supabase Storage
```

Free tier: 1GB storage, 2GB bandwidth/month. No credit card required.

Provider:

```text id="supabase-storage"
https://supabase.com
```

---

## Queue System

Recommended:

```text id="ckaj9o"
Upstash (Redis)
```

Free tier: 10,000 commands/day, no credit card required.

Provider:

```text id="t02g1k"
https://upstash.com
```

---

## Vector Database

Recommended:

```text id="p7mxkp"
ChromaDB (self-hosted on Render)
```

Runs as a second Render free service alongside the backend.

---

# 4. Production Folder Structure

```text id="dpkpjh"
project/

├── frontend/
├── backend/
├── docs/
├── infrastructure/
├── scripts/
└── docker/
```

---

# 5. Environment Variables

## Frontend

### .env.local

```env id="35jzwd"
REACT_PUBLIC_API_URL=
REACT_PUBLIC_APP_URL=
```

---

## Backend

### .env

```env id="7t5vbq"
DATABASE_URL=
REDIS_URL=
GROQ_API_KEY=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CHROMA_PATH=
```

---

# 6. Local Development Setup

---

## Clone Repository

```bash id="bjlwmq"
git clone <repo-url>
```

---

## Frontend

```bash id="ydkfln"
cd frontend
npm install
npm run dev
```

---

## Backend

```bash id="ifqef0"
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Database

Run PostgreSQL locally.

---

## Redis

Run:

```bash id="79qf9o"
docker run -p 6379:6379 redis
```

---

# 7. Docker Configuration

## Backend Dockerfile

```dockerfile id="a7yr4k"
FROM python:3.12

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
```

---

## Frontend Dockerfile

```dockerfile id="q7nq0l"
FROM node:20

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

CMD ["npm","start"]
```

---

# 8. PostgreSQL Setup

## Production Providers

### Neon

Recommended.

---

### Supabase

Alternative.

---

## Create Database

Example:

```sql id="ed7rmw"
CREATE DATABASE ai_analyst;
```

---

## Run Migrations

```bash id="e2vjg6"
alembic upgrade head
```

---

# 9. Supabase Storage Setup

## Create Project

Go to https://supabase.com → New project (free).

---

## Create Storage Bucket

```text id="3b0oky"
Bucket name: analytica-ai
Access: Public
```

---

## Folder Structure

```text id="3t4ie7"
datasets/
reports/
exports/
models/
```

---

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=analytica-ai
```

---

## Development Alternative

For local development, use local storage instead:

```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./storage
```

No credentials needed. Files stored in the `storage/` folder.

---

# 10. Groq Configuration

## Required Variables

```env id="3nf0l9"
GROQ_API_KEY=
```

---

## Model

Recommended:

```text id="rx5d7l"
llama-3.3-70b-versatile
```

Fast (routing/intent tasks):

```text id="rx5d7l-fast"
llama-3.1-8b-instant
```

---

## Embeddings

> Groq does not provide an embeddings API.
> Use `nomic-embed-text` via Ollama (local) or Nomic API (production).

Recommended for development:

```bash
ollama pull nomic-embed-text
```

Recommended for production:

```text id="efh3qf"
Nomic API — https://atlas.nomic.ai
```

---

# 11. ChromaDB Setup

## Local

```python id="9n0wpx"
from chromadb import PersistentClient
```

---

## Path

```env id="q14mmt"
CHROMA_PATH=/chroma
```

---

## Collections

```text id="3suloe"
datasets
reports
chat_history
insights
```

---

# 12. Celery Configuration

## Install

```bash id="w6fjlwm"
pip install celery
```

---

## Broker

```env id="b32h2i"
REDIS_URL=
```

---

## Start Worker

```bash id="4f6bg8"
celery -A app.worker worker
```

---

# 13. Frontend Deployment

## Vercel

### Connect GitHub

Import project.

---

### Configure Environment Variables

```env id="0h6cxh"
REACT_PUBLIC_API_URL
```

---

### Deploy

```bash id="7r4g2v"
git push main
```

---

## Domain

Example:

```text id="lgzy0y"
app.example.com
```

---

# 14. Backend Deployment

# 14. Backend Deployment

## Render (free tier — 750 hours/month)

### Step 1 — Create Account

Go to https://render.com → Sign up with GitHub.

---

### Step 2 — New Web Service

Click New → Web Service → Connect your GitHub repo.

---

### Step 3 — Configure

```text
Name:         analytica-backend
Runtime:      Docker
Branch:       main
Root Dir:     backend/
```

---

### Step 4 — Set Environment Variables

In Render dashboard → Environment:

```env id="2b7yn0"
DATABASE_URL
GROQ_API_KEY
JWT_SECRET
REDIS_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STORAGE_PROVIDER=supabase
```

---

### Step 5 — Deploy

Click Deploy. Render builds and deploys automatically on every push to `main`.

---

### Step 6 — Run DB Migrations

In Render dashboard → Shell:

```bash
alembic upgrade head
```

---

## Backend Domain

Render provides a free subdomain:

```text id="i5xsnv"
https://analytica-backend.onrender.com
```

> Note: Free tier spins down after 15 minutes of inactivity.
> First request after idle takes ~30 seconds (cold start).
> Acceptable for portfolio/demo use.

---

# 15. CI/CD Pipeline

## GitHub Actions

Workflow:

```text id="7g1wvl"
Push
 ↓
Test
 ↓
Build
 ↓
Deploy
```

---

## Example Workflow

```yaml id="1v7q3v"
name: Deploy

on:
  push:
    branches:
      - main
```

---

# 16. Monitoring

## Error Monitoring

Recommended:

```text id="80sjzj"
Sentry
```

---

## Metrics

Recommended:

```text id="95z99w"
Prometheus
Grafana
```

---

## Track

* API latency
* Errors
* Token usage
* Cost

---

# 17. Logging

Store:

```text id="hz8fhi"
Request Logs
Agent Logs
Error Logs
```

---

## Python Logging

```python id="y8b9m0"
import logging
```

---

# 18. Security Checklist

## JWT Authentication

Enabled.

---

## HTTPS

Required.

---

## Rate Limiting

```text id="sxd7ws"
100 requests/minute
```

---

## Password Hashing

```text id="dhn2x6"
bcrypt
```

---

## Secrets

Never commit:

```env id="1l4cvd"
.env
```

---

# 19. Backup Strategy

## PostgreSQL

Daily backup.

---

## S3

Versioning enabled.

---

## ChromaDB

Weekly backup.

---

## Recovery Objective

```text id="fjr9sw"
< 1 hour
```

---

# 20. Production Readiness Checklist

## Backend

* Health endpoint
* Logging
* Error handling
* Validation

---

## Frontend

* Responsive
* Error states
* Loading states

---

## Database

* Migrations
* Indexes

---

## Storage

* S3 connected

---

## AI

* Groq API configured (GROQ_API_KEY set)
* Embeddings configured (Ollama running or Nomic API key set)

---

# 21. Cost Estimate

## MVP

### Vercel

Free

---

### Render (backend hosting)

Free (750 hours/month)

---

### Neon (PostgreSQL)

Free (0.5GB)

---

### Upstash (Redis)

Free (10,000 commands/day)

---

### Groq

$0/month (free tier: 14,400 req/day — more than enough for MVP)

---

### Supabase Storage

$0/month (free tier: 1GB storage, 2GB bandwidth)

---

### S3

$1–5/month

---

## Total

```text id="9bguq0"
$0/month (all free tiers)
```

> Free tier limits for reference:
> - Vercel: unlimited for personal projects
> - Render: 750 hours/month (1 service runs free)
> - Neon: 0.5GB PostgreSQL
> - Upstash: 10,000 Redis commands/day
> - Supabase Storage: 1GB storage
> - Groq: 14,400 requests/day
> - ChromaDB: self-hosted (no cost)

---

# 22. Scaling Strategy

## Stage 1

Single backend instance.

---

## Stage 2

Multiple workers.

---

## Stage 3

Load balancer.

---

## Stage 4

Microservices.

---

```text id="6lsp4u"
Users
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

# 23. Health Checks

## Backend

```http id="nqkwts"
GET /health
```

### Response

```json id="3gj7v6"
{
  "status": "healthy"
}
```

---

## Database

Connection check.

---

## Redis

Connection check.

---

## Groq

API availability check.

---

# 24. Launch Checklist

Before release:

* Authentication works
* Upload works
* Profiling works
* EDA works
* Chat works
* Dashboards work
* Reports work
* Monitoring enabled
* HTTPS enabled
* Backups configured

---

# 25. Post-Launch Tasks

## Week 1

Collect bug reports.

---

## Week 2

Optimize performance.

---

## Week 3

Add forecasting.

---

## Week 4

Add AutoML.

---

# Final Production Architecture

```text id="9j0owv"
Vercel (free)
   │
React.js Frontend
   │
Render (free)
   │
FastAPI Backend
   │
Upstash Redis + Celery (free)
   │
Neon PostgreSQL (free)
   │
ChromaDB (self-hosted on Render)
   │
Supabase Storage (free)
   │
Groq API (free tier)
   │
Nomic Embeddings (free via Ollama/Nomic)
```

This deployment architecture is optimized for low-cost operation, rapid development, portfolio demonstrations, internship showcases, and future migration into a scalable SaaS platform.