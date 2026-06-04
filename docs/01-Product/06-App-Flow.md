# 06-App-Flow.md

# AI Data Analyst Agent

## Application Flow Document

Version: 1.0

---

# 1. Purpose

This document defines the complete user journey and system workflow of the AI Data Analyst Agent platform.

It describes:

* User interactions
* Screen transitions
* AI agent execution flow
* Dataset lifecycle
* Dashboard generation flow
* Chat workflow
* AutoML workflow
* Report generation workflow

---

# 2. High-Level User Journey

```text
Landing Page
      ↓
Authentication
      ↓
Dashboard
      ↓
Upload Dataset
      ↓
Data Profiling
      ↓
Data Cleaning
      ↓
EDA Generation
      ↓
Dashboard Generation
      ↓
Chat With Data
      ↓
Insights & Predictions
      ↓
Generate Report
      ↓
Export / Save
```

---

# 3. Authentication Flow

## User Registration

```text
Landing Page
      ↓
Sign Up
      ↓
Enter Details
      ↓
Verify Email
      ↓
Create Workspace
      ↓
Dashboard
```

---

## User Login

```text
Login
      ↓
Credentials Check
      ↓
Authentication Success
      ↓
Dashboard
```

---

## Forgot Password

```text
Forgot Password
      ↓
Email Verification
      ↓
Reset Password
      ↓
Login
```

---

# 4. Dashboard Flow

## First-Time User

```text
Dashboard
      ↓
No Dataset Found
      ↓
Upload Dataset CTA
```

---

## Existing User

```text
Dashboard
      ↓
Recent Datasets
      ↓
Select Dataset
      ↓
Dataset Workspace
```

---

# 5. Dataset Upload Flow

## Upload Screen

Supported Formats:

* CSV
* XLSX
* JSON

---

## Workflow

```text
Select File
      ↓
Validate File
      ↓
Upload Storage
      ↓
Schema Detection
      ↓
Create Dataset Record
      ↓
Start Profiling Agent
```

---

## Validation Rules

### File Size

Maximum:

100 MB (MVP)

---

### Required Checks

* Empty file
* Corrupted file
* Unsupported format
* Duplicate upload

---

# 6. Dataset Profiling Flow

## Trigger

Immediately after upload.

---

## Profiling Agent Tasks

### Dataset Overview

Detect:

* Rows
* Columns
* Dataset size

---

### Data Types

Detect:

* Integer
* Float
* String
* Boolean
* Date

---

### Quality Analysis

Detect:

* Missing values
* Duplicates
* Invalid values
* Outliers

---

### Statistics

Generate:

* Mean
* Median
* Mode
* Min
* Max
* Standard Deviation

---

## Output

```text
Profile Generated
      ↓
Health Score Created
      ↓
Cleaning Recommendations
```

---

# 7. Data Cleaning Flow

## Cleaning Agent Starts

```text
Profiling Complete
      ↓
Cleaning Suggestions
      ↓
User Approval
      ↓
Cleaning Execution
```

---

## Missing Values

Options:

* Mean
* Median
* Mode
* Forward Fill
* Drop Records

---

## Duplicates

```text
Duplicate Detection
      ↓
Preview
      ↓
Delete Duplicates
```

---

## Outliers

```text
Outlier Detection
      ↓
Visual Preview
      ↓
Remove / Keep
```

---

## Result

```text
Clean Dataset Version Created
```

---

# 8. EDA Flow

## Trigger

After cleaning.

---

## EDA Agent

Generates automatically.

---

### Numerical Analysis

* Distribution
* Variance
* Standard deviation

---

### Correlation Analysis

```text
Correlation Matrix
      ↓
Heatmap
```

---

### Categorical Analysis

Generate:

* Frequency Charts
* Pie Charts
* Bar Charts

---

### Time-Series Analysis

Generate:

* Trend Graphs
* Growth Analysis

---

## Output

```text
EDA Report
      ↓
Dashboard Builder
```

---

# 9. Dashboard Generation Flow

## Dashboard Agent

Creates dashboard automatically.

---

### KPI Cards

Examples:

* Revenue
* Orders
* Customers
* Profit

---

### Visual Components

* Line Charts
* Pie Charts
* Bar Charts
* Tables
* Heatmaps

---

### Layout Engine

Determines:

* Chart placement
* Widget size
* Widget priority

---

## Output

```text
Interactive Dashboard
```

---

# 10. Chat With Data Flow

## User Query

Examples:

"What caused sales decline?"

"Top customers?"

"Predict next month revenue."

---

## Processing Pipeline

```text
User Question
      ↓
Intent Detection
      ↓
Dataset Context Retrieval
      ↓
Agent Selection
      ↓
Analysis Execution
      ↓
LLM Response
```

---

## Agent Selection

### Insight Questions

→ Insight Agent

### Data Questions

→ Query Agent

### Prediction Questions

→ ML Agent

### Dashboard Requests

→ Dashboard Agent

---

## Response Types

* Text
* Charts
* Tables
* KPIs
* Forecasts

---

# 11. Natural Language Query Flow

## Example

User:

"Show sales by city."

---

System:

```text
Question
      ↓
Understand Intent
      ↓
Convert To Data Query
      ↓
Execute Query
      ↓
Generate Visualization
      ↓
Generate Explanation
```

---

# 12. Insight Generation Flow

## Insight Agent

Analyzes:

* Trends
* Risks
* Opportunities

---

### Example Insights

Revenue increased 18%.

Customer retention dropped 12%.

North region outperforming others.

---

## Workflow

```text
Dataset
      ↓
Pattern Detection
      ↓
Business Interpretation
      ↓
Insight Generation
```

---

# 13. AutoML Flow

## Trigger

User clicks:

"Build Prediction Model"

or

AI detects predictive opportunity.

---

## Workflow

```text
Dataset Analysis
      ↓
Problem Type Detection
      ↓
Feature Selection
      ↓
Model Training
      ↓
Evaluation
      ↓
Best Model Selection
```

---

## Classification

Possible Models:

* Random Forest
* XGBoost
* LightGBM

---

## Regression

Possible Models:

* Linear Regression
* Random Forest
* XGBoost

---

## Time Series

Possible Models:

* Prophet
* LSTM
* XGBoost

---

# 14. Forecasting Flow

## User Request

Predict future values.

---

## Workflow

```text
Historical Data
      ↓
Feature Engineering
      ↓
Model Selection
      ↓
Training
      ↓
Prediction
      ↓
Forecast Visualization
```

---

## Outputs

* Forecast Table
* Confidence Interval
* Forecast Graph

---

# 15. Anomaly Detection Flow

## User Request

Find unusual records.

---

## Workflow

```text
Dataset
      ↓
Anomaly Agent
      ↓
Isolation Forest
      ↓
Scoring
      ↓
Anomaly Report
```

---

## Output

* Anomaly List
* Severity Score
* Explanation

---

# 16. Report Generation Flow

## Trigger

Generate Report Button

---

## Workflow

```text
Dataset
      ↓
Insights
      ↓
Visualizations
      ↓
Predictions
      ↓
Report Generator
```

---

## Report Sections

### Executive Summary

### Dataset Overview

### Key Metrics

### Visualizations

### Insights

### Forecasts

### Recommendations

---

## Export Formats

* PDF
* DOCX

---

# 17. Dataset Memory Flow

## Purpose

Remember past analyses.

---

## Stored Information

* Dataset metadata
* User queries
* Generated reports
* Dashboard configuration

---

## Workflow

```text
Analysis Completed
      ↓
Store Context
      ↓
Vector Database
      ↓
Future Retrieval
```

---

# 18. Workspace Flow

```text
Workspace
      ↓
Datasets
      ↓
Reports
      ↓
Saved Dashboards
      ↓
Chat History
```

---

# 19. Error Handling Flow

## Upload Errors

```text
Invalid File
      ↓
Error Message
      ↓
Retry Upload
```

---

## AI Failure

```text
Agent Failure
      ↓
Fallback Agent
      ↓
Retry
      ↓
User Notification
```

---

## Forecast Failure

```text
Insufficient Data
      ↓
Explain Reason
      ↓
Suggest Alternative Analysis
```

---

# 20. End-to-End System Flow

```text
User Uploads Dataset
            ↓
Dataset Profiling Agent
            ↓
Cleaning Agent
            ↓
EDA Agent
            ↓
Dashboard Agent
            ↓
Insight Agent
            ↓
ML Agent
            ↓
Forecast Agent
            ↓
Report Agent
            ↓
Chat Interface
            ↓
Export Results
```

---

# Final User Experience

Upload Data
→ AI Understands Data
→ AI Cleans Data
→ AI Builds Dashboard
→ User Chats With Data
→ AI Generates Insights
→ AI Trains Models
→ AI Forecasts Future
→ AI Creates Reports

No SQL.
No Coding.
No Manual Dashboard Building.
