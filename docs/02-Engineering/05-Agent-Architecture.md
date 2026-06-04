# 05-Agent-Architecture.md

# AI Data Analyst Agent

## Agent Architecture Document

Version: 1.0

---

# 1. Purpose

This document defines the complete Agentic AI architecture for the AI Data Analyst Agent platform.

It describes:

* Agent responsibilities
* Agent communication
* LangGraph orchestration
* Tool usage
* Shared memory
* Decision routing
* State management
* Error recovery
* Multi-agent workflows

---

# 2. Agentic System Overview

Instead of a single LLM handling all tasks, the platform uses specialized agents.

Each agent performs one responsibility exceptionally well.

---

## Benefits

### Better Accuracy

Specialized reasoning.

---

### Better Scalability

New agents can be added.

---

### Better Maintainability

Independent upgrades.

---

### Better Explainability

Clear execution paths.

---

# 3. High-Level Agent Architecture

```text id="g0v8kl"
                     User
                       │
                       ▼
             Orchestrator Agent
                       │
 ┌──────────┬──────────┬──────────┬──────────┐
 ▼          ▼          ▼          ▼          ▼

Dataset   Cleaning    EDA      Insight     ML
Agent     Agent       Agent     Agent      Agent

                       │
                       ▼

                 Forecast Agent

                       │
                       ▼

                  Report Agent
```

---

# 4. Core Design Principles

## Principle 1

One agent = one responsibility.

---

## Principle 2

Agents communicate through shared state.

---

## Principle 3

Agents should be stateless where possible.

---

## Principle 4

Business logic stays outside prompts.

---

## Principle 5

All agent outputs must be structured.

---

# 5. Orchestrator Agent

## Purpose

Central coordinator.

---

## Responsibilities

* Receive user requests
* Determine required agents
* Route execution
* Merge results
* Return final response

---

## Example

User asks:

```text id="g2k9gk"
Forecast revenue for next month.
```

Orchestrator decides:

```text id="l3k6nb"
Dataset Agent
     ↓
ML Agent
     ↓
Forecast Agent
```

---

# 6. Shared State Model

All agents use a shared state.

---

## State Structure

```python id="i8y0ua"
state = {
    "dataset": {},
    "profile": {},
    "insights": [],
    "models": [],
    "forecasts": [],
    "messages": [],
    "current_task": ""
}
```

---

## Advantages

* Context preservation
* Easier debugging
* Multi-step workflows

---

# 7. Dataset Understanding Agent

## Agent ID

```text id="zkzjkn"
dataset_agent
```

---

## Purpose

Understand uploaded data.

---

## Responsibilities

### Schema Analysis

### Column Classification

### Business Context Detection

### Dataset Summarization

---

## Inputs

* Dataset
* Metadata

---

## Outputs

```json id="l45ejd"
{
  "dataset_type": "sales",
  "columns": [],
  "summary": ""
}
```

---

## Tools

* Pandas
* Schema Profiler

---

# 8. Cleaning Agent

## Agent ID

```text id="25v11j"
cleaning_agent
```

---

## Purpose

Prepare dataset.

---

## Responsibilities

### Missing Values

### Duplicate Removal

### Outlier Detection

### Type Corrections

---

## Inputs

Dataset profile.

---

## Outputs

```json id="l9dh4i"
{
  "cleaning_steps": [],
  "health_score": 92
}
```

---

## Tools

* Pandas
* NumPy

---

# 9. EDA Agent

## Agent ID

```text id="ic90aw"
eda_agent
```

---

## Purpose

Generate analytics.

---

## Responsibilities

### Statistical Analysis

### Correlations

### Trends

### Visualization Recommendations

---

## Outputs

```json id="n9mv1t"
{
  "statistics": {},
  "charts": []
}
```

---

## Tools

* Plotly
* Pandas
* NumPy

---

# 10. Insight Agent

## Agent ID

```text id="ntpwhb"
insight_agent
```

---

## Purpose

Convert data into business insights.

---

## Responsibilities

### Trend Detection

### Opportunity Detection

### Risk Identification

### Recommendations

---

## Example Output

```json id="d3x2ql"
{
  "insights": [
    {
      "type": "risk",
      "message": "Revenue dropped 12%"
    }
  ]
}
```

---

## Tools

* LLM
* RAG Memory

---

# 11. ML Agent

## Agent ID

```text id="sp8cys"
ml_agent
```

---

## Purpose

Manage AutoML.

---

## Responsibilities

### Problem Detection

### Model Selection

### Training

### Evaluation

---

## Supported Tasks

### Classification

### Regression

### Forecasting

---

## Models

```text id="7khmcl"
Random Forest
XGBoost
LightGBM
```

---

# 12. Forecast Agent

## Agent ID

```text id="4jv67q"
forecast_agent
```

---

## Purpose

Future prediction generation.

---

## Inputs

Time-series data.

---

## Outputs

```json id="xpfytg"
{
  "forecast": [],
  "confidence_interval": []
}
```

---

## Models

### Prophet

### XGBoost

### LSTM

---

# 13. Anomaly Agent

## Agent ID

```text id="nnqejg"
anomaly_agent
```

---

## Purpose

Find unusual records.

---

## Responsibilities

### Score Records

### Detect Outliers

### Explain Anomalies

---

## Algorithms

### Isolation Forest

### DBSCAN

### LOF

---

# 14. Dashboard Agent

## Agent ID

```text id="j3g5lu"
dashboard_agent
```

---

## Purpose

Generate dashboards automatically.

---

## Responsibilities

### KPI Selection

### Chart Selection

### Layout Generation

---

## Output

```json id="cfccz5"
{
  "widgets": []
}
```

---

# 15. Report Agent

## Agent ID

```text id="jyv0fu"
report_agent
```

---

## Purpose

Generate reports.

---

## Responsibilities

### Executive Reports

### Technical Reports

### Forecast Reports

---

## Formats

* PDF
* DOCX

---

# 16. Memory Agent

## Agent ID

```text id="y6c0k6"
memory_agent
```

---

## Purpose

Maintain long-term memory.

---

## Responsibilities

### Store Context

### Retrieve Context

### Dataset Recall

### Chat Recall

---

## Storage

```text id="8awrxk"
ChromaDB
```

---

# 17. Tool Calling Architecture

Agents never directly manipulate data.

They use tools.

---

## Example

```text id="ey8cfk"
Agent
  ↓
Tool Call
  ↓
Execution
  ↓
Result
```

---

# 18. Tool Registry

## Dataset Tools

```text id="6ajkxt"
load_dataset
save_dataset
profile_dataset
```

---

## Cleaning Tools

```text id="ukmjlwm"
remove_duplicates
fill_missing
detect_outliers
```

---

## Visualization Tools

```text id="stc5kx"
generate_chart
generate_heatmap
generate_dashboard
```

---

## ML Tools

```text id="e7cncf"
train_model
evaluate_model
predict
```

---

## Forecast Tools

```text id="ylu81j"
forecast_future
generate_trend
```

---

# 19. LangGraph State Machine

```text id="z8ntrr"
START
  ↓
Dataset Agent
  ↓
Cleaning Agent
  ↓
EDA Agent
  ↓
Decision Node
```

---

## Decision Node

Possible branches:

```text id="7jjwb5"
Forecast
AutoML
Report
Dashboard
Chat
```

---

# 20. Query Routing Flow

User query:

```text id="mjlwm0"
Show top customers.
```

Route:

```text id="gv4rxf"
Dataset Agent
      ↓
EDA Agent
```

---

User query:

```text id="q9s52v"
Predict next month sales.
```

Route:

```text id="hivvzk"
Dataset Agent
      ↓
ML Agent
      ↓
Forecast Agent
```

---

# 21. Multi-Agent Workflow Example

User:

```text id="xjiq7m"
Analyze my sales data.
```

Execution:

```text id="ekv7u9"
Dataset Agent
      ↓
Cleaning Agent
      ↓
EDA Agent
      ↓
Insight Agent
      ↓
Dashboard Agent
      ↓
Report Agent
```

---

# 22. Error Handling

## Agent Failure

```text id="5qrf4u"
Failure
   ↓
Retry
   ↓
Fallback
   ↓
Human-readable error
```

---

## Retry Policy

Maximum:

```text id="a8z0q5"
3 retries
```

---

# 23. Agent Observability

Each agent logs:

### Start Time

### End Time

### Tokens Used

### Tools Called

### Errors

---

# 24. Agent Metrics

Track:

* Success Rate
* Latency
* Cost
* Token Usage

---

## Example

```json id="h8ewsw"
{
  "agent": "insight_agent",
  "latency": 2.1,
  "success": true
}
```

---

# 25. Security Model

Agents only receive:

### Necessary Context

Not entire database access.

---

## Permissions

```text id="0cb8n3"
read_dataset
write_report
train_model
```

---

# 26. Future Agent Expansion

### SQL Agent

Generate SQL.

---

### Data Engineer Agent

Build pipelines.

---

### Visualization Agent

Advanced charts.

---

### Business Strategy Agent

Executive recommendations.

---

### Monitoring Agent

Continuous dataset monitoring.

---

# 27. Production Workflow

```text id="y6jkrg"
User Query
      ↓
Orchestrator
      ↓
Memory Retrieval
      ↓
Agent Selection
      ↓
Tool Execution
      ↓
State Update
      ↓
Response Generation
      ↓
Memory Storage
```

---

# Final Agent Architecture

```text id="9gaj63"
                     User
                       │
                       ▼
               Orchestrator
                       │
 ┌──────────┬──────────┬──────────┬──────────┐
 ▼          ▼          ▼          ▼          ▼

Dataset   Cleaning    EDA      Insight      ML
Agent     Agent       Agent     Agent       Agent

                       │
          ┌────────────┼────────────┐
          ▼                         ▼

   Forecast Agent          Dashboard Agent

          ▼                         ▼

                  Report Agent

                       ▼

                  Memory Agent
```

The system follows a modular multi-agent architecture where each agent owns a specialized responsibility and collaborates through shared state and tool execution, enabling scalable, explainable, and production-ready Agentic AI workflows.
