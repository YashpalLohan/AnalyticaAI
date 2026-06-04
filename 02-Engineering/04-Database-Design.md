# 04-Database-Design.md

# AI Data Analyst Agent

## Database Design Document

Version: 1.0

---

# 1. Purpose

This document defines the complete database architecture for the AI Data Analyst Agent platform.

It covers:

* PostgreSQL schema design
* Table relationships
* Entity relationships
* Indexing strategy
* Data retention
* Versioning
* Scalability considerations

---

# 2. Database Overview

The platform uses a hybrid storage architecture.

## Relational Storage

PostgreSQL

Stores:

* Users
* Datasets
* Reports
* Forecasts
* Models
* Chat History
* Dashboard Metadata

---

## Vector Storage

ChromaDB

Stores:

* Dataset embeddings
* Report embeddings
* Chat embeddings
* Insight embeddings

---

## Object Storage

Supabase Storage (free tier: 1GB)

Stores:

* Uploaded files
* Generated reports
* Exported dashboards

---

# 3. Entity Relationship Diagram

```text
User
 │
 ├── Datasets
 │      │
 │      ├── DatasetVersions
 │      ├── DatasetProfiles
 │      ├── Dashboards
 │      ├── Reports
 │      ├── Forecasts
 │      ├── Models
 │      ├── Insights
 │      └── Chats
 │
 └── Workspaces
```

---

# 4. Core Tables

## Users

Stores user information.

### Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Indexes

```sql
CREATE INDEX idx_users_email
ON users(email);
```

---

# 5. Workspaces

Future multi-tenant support.

### Schema

```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255),
    created_at TIMESTAMP
);
```

---

# 6. User Workspace Memberships

```sql
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(50),
    created_at TIMESTAMP
);
```

---

# 7. Datasets

Most important table.

### Schema

```sql
CREATE TABLE datasets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    workspace_id UUID REFERENCES workspaces(id),

    name VARCHAR(255),

    original_file_url TEXT,
    cleaned_file_url TEXT,

    file_size BIGINT,

    total_rows INTEGER,
    total_columns INTEGER,

    status VARCHAR(50),

    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Dataset Status

```text
uploaded
profiling
cleaning
analyzing
completed
failed
```

---

# 8. Dataset Versions

Stores multiple dataset versions.

### Schema

```sql
CREATE TABLE dataset_versions (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    version_number INTEGER,

    file_url TEXT,

    description TEXT,

    created_at TIMESTAMP
);
```

---

# 9. Dataset Profiles

Stores profiling results.

### Schema

```sql
CREATE TABLE dataset_profiles (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    row_count INTEGER,
    column_count INTEGER,

    missing_values INTEGER,
    duplicate_rows INTEGER,

    outlier_count INTEGER,

    health_score NUMERIC,

    profile_json JSONB,

    created_at TIMESTAMP
);
```

---

# 10. Dataset Columns

Stores schema information.

### Schema

```sql
CREATE TABLE dataset_columns (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    column_name VARCHAR(255),

    data_type VARCHAR(50),

    null_percentage NUMERIC,

    unique_count INTEGER,

    statistics JSONB
);
```

---

# 11. Dashboards

Stores generated dashboards.

### Schema

```sql
CREATE TABLE dashboards (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    title VARCHAR(255),

    layout_json JSONB,

    widget_count INTEGER,

    created_at TIMESTAMP
);
```

---

# 12. Dashboard Widgets

Stores widget configurations.

### Schema

```sql
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY,

    dashboard_id UUID REFERENCES dashboards(id),

    widget_type VARCHAR(50),

    title VARCHAR(255),

    config_json JSONB,

    position_x INTEGER,
    position_y INTEGER,

    width INTEGER,
    height INTEGER
);
```

---

# 13. Chat Sessions

Stores chat threads.

### Schema

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    user_id UUID REFERENCES users(id),

    title VARCHAR(255),

    created_at TIMESTAMP
);
```

---

# 14. Chat Messages

Stores individual messages.

### Schema

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,

    session_id UUID REFERENCES chat_sessions(id),

    role VARCHAR(20),

    content TEXT,

    metadata JSONB,

    created_at TIMESTAMP
);
```

---

## Roles

```text
user
assistant
system
```

---

# 15. Insights

Stores AI-generated insights.

### Schema

```sql
CREATE TABLE insights (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    title VARCHAR(255),

    category VARCHAR(100),

    severity VARCHAR(50),

    description TEXT,

    metadata JSONB,

    created_at TIMESTAMP
);
```

---

## Categories

```text
trend
risk
opportunity
anomaly
recommendation
```

---

# 16. Forecasts

Stores forecasting results.

### Schema

```sql
CREATE TABLE forecasts (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    model_name VARCHAR(255),

    target_column VARCHAR(255),

    forecast_horizon INTEGER,

    metrics JSONB,

    forecast_json JSONB,

    created_at TIMESTAMP
);
```

---

# 17. ML Models

Stores trained models.

### Schema

```sql
CREATE TABLE ml_models (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    model_name VARCHAR(255),

    model_type VARCHAR(100),

    target_column VARCHAR(255),

    metrics JSONB,

    model_path TEXT,

    created_at TIMESTAMP
);
```

---

# 18. Reports

Stores generated reports.

### Schema

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    report_type VARCHAR(100),

    title VARCHAR(255),

    pdf_url TEXT,

    docx_url TEXT,

    created_at TIMESTAMP
);
```

---

## Report Types

```text
executive
technical
forecast
custom
```

---

# 19. AutoML Runs

Stores training jobs.

### Schema

```sql
CREATE TABLE automl_runs (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    status VARCHAR(50),

    best_model VARCHAR(255),

    leaderboard JSONB,

    created_at TIMESTAMP
);
```

---

# 20. Anomaly Detection Results

### Schema

```sql
CREATE TABLE anomaly_results (
    id UUID PRIMARY KEY,

    dataset_id UUID REFERENCES datasets(id),

    record_identifier TEXT,

    anomaly_score NUMERIC,

    severity VARCHAR(50),

    explanation TEXT,

    created_at TIMESTAMP
);
```

---

# 21. Activity Logs

Tracks user actions.

### Schema

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,

    user_id UUID REFERENCES users(id),

    action VARCHAR(255),

    metadata JSONB,

    created_at TIMESTAMP
);
```

---

# 22. Notifications

### Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,

    user_id UUID REFERENCES users(id),

    title VARCHAR(255),

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP
);
```

---

# 23. API Keys (Future)

### Schema

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,

    user_id UUID REFERENCES users(id),

    key_hash TEXT,

    last_used TIMESTAMP,

    created_at TIMESTAMP
);
```

---

# 24. Indexing Strategy

## High Priority Indexes

```sql
CREATE INDEX idx_datasets_user_id
ON datasets(user_id);

CREATE INDEX idx_reports_dataset_id
ON reports(dataset_id);

CREATE INDEX idx_forecasts_dataset_id
ON forecasts(dataset_id);

CREATE INDEX idx_messages_session_id
ON chat_messages(session_id);
```

---

# 25. JSONB Usage

Used for flexible storage.

Examples:

* Dashboard layouts
* Forecast results
* Profiling reports
* Agent metadata
* Model metrics

---

# 26. ChromaDB Collections

## Dataset Collection

Stores dataset embeddings.

---

## Chat Collection

Stores conversation embeddings.

---

## Insight Collection

Stores generated insights.

---

## Report Collection

Stores reports.

---

# 27. S3 Storage Structure

```text
users/
│
├── datasets/
│
├── reports/
│
├── exports/
│
└── models/
```

---

# 28. Data Retention Policy

## Dataset Files

Retain until deleted.

---

## Chat History

Retain indefinitely.

---

## Logs

Retain 90 days.

---

## Forecasts

Retain indefinitely.

---

# 29. Scalability Plan

## MVP

Single PostgreSQL instance.

---

## V2

Read replicas.

---

## V3

Partitioning.

---

### Dataset Partitioning

```sql
PARTITION BY RANGE(created_at)
```

---

# 30. Backup Strategy

## Database

Daily backup.

---

## S3

Versioning enabled.

---

## Recovery Target

Restore within 1 hour.

---

# 31. Future Database Enhancements

### Team Collaboration

Shared workspaces.

### Audit Logs

Compliance tracking.

### Billing

Subscription management.

### Feature Store

ML feature reuse.

### Data Lineage

Dataset tracking.

---

# Final Database Summary

```text
Users
 │
 ├── Workspaces
 │
 ├── Datasets
 │      ├── Versions
 │      ├── Profiles
 │      ├── Dashboards
 │      ├── Reports
 │      ├── Forecasts
 │      ├── Models
 │      ├── Insights
 │      └── Chats
 │
 └── Notifications
```

The database architecture is designed for scalability, AI workflows, dataset versioning, AutoML operations, forecasting pipelines, and future enterprise SaaS expansion.