# 08-API-Specification.md

# AI Data Analyst Agent

## API Specification Document

Version: 1.0

Base URL:

```text
/api/v1
```

Authentication:

```text
Bearer JWT Token
```

Content Type:

```text
application/json
```

---

# 1. API Overview

The API layer provides access to:

* Authentication
* Dataset Management
* Data Profiling
* Cleaning Operations
* Dashboards
* AI Chat
* Insights
* Forecasting
* AutoML
* Reports
* User Settings

---

# 2. Authentication APIs

---

## Register User

### Endpoint

```http
POST /auth/register
```

### Request

```json
{
  "full_name": "Yashpal",
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "success": true,
  "user_id": "uuid"
}
```

---

## Login

### Endpoint

```http
POST /auth/login
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "access_token": "jwt",
  "refresh_token": "jwt",
  "expires_in": 900
}
```

---

## Refresh Token

```http
POST /auth/refresh
```

---

## Logout

```http
POST /auth/logout
```

---

# 3. User APIs

---

## Get Current User

```http
GET /users/me
```

### Response

```json
{
  "id": "uuid",
  "name": "Yashpal",
  "email": "user@example.com"
}
```

---

## Update Profile

```http
PATCH /users/me
```

---

# 4. Dataset APIs

---

## Upload Dataset

```http
POST /datasets/upload
```

### Multipart Form Data

```text
file = dataset.csv
```

### Response

```json
{
  "dataset_id": "uuid",
  "status": "uploaded"
}
```

---

## Get All Datasets

```http
GET /datasets
```

### Response

```json
[
  {
    "id": "uuid",
    "name": "Sales Dataset"
  }
]
```

---

## Get Dataset

```http
GET /datasets/{dataset_id}
```

---

## Delete Dataset

```http
DELETE /datasets/{dataset_id}
```

---

## Rename Dataset

```http
PATCH /datasets/{dataset_id}
```

### Request

```json
{
  "name": "Updated Dataset Name"
}
```

---

# 5. Dataset Profiling APIs

---

## Generate Profile

```http
POST /datasets/{dataset_id}/profile
```

### Response

```json
{
  "job_id": "uuid"
}
```

---

## Get Profile

```http
GET /datasets/{dataset_id}/profile
```

### Response

```json
{
  "row_count": 10000,
  "column_count": 20,
  "health_score": 92
}
```

---

# 6. Data Cleaning APIs

---

## Get Cleaning Suggestions

```http
GET /datasets/{dataset_id}/cleaning
```

### Response

```json
{
  "missing_values": 42,
  "duplicates": 11,
  "outliers": 20
}
```

---

## Apply Cleaning

```http
POST /datasets/{dataset_id}/cleaning/apply
```

### Request

```json
{
  "missing_strategy": "median",
  "remove_duplicates": true,
  "remove_outliers": true
}
```

---

# 7. EDA APIs

---

## Generate EDA

```http
POST /datasets/{dataset_id}/eda
```

---

## Get EDA Results

```http
GET /datasets/{dataset_id}/eda
```

### Response

```json
{
  "charts": [],
  "statistics": {}
}
```

---

# 8. Dashboard APIs

---

## Generate Dashboard

```http
POST /datasets/{dataset_id}/dashboard
```

---

## Get Dashboard

```http
GET /dashboards/{dashboard_id}
```

### Response

```json
{
  "widgets": [],
  "layout": []
}
```

---

## Update Dashboard Layout

```http
PATCH /dashboards/{dashboard_id}
```

---

## Delete Dashboard

```http
DELETE /dashboards/{dashboard_id}
```

---

# 9. AI Chat APIs

---

## Send Message

```http
POST /chat/query
```

### Request

```json
{
  "dataset_id": "uuid",
  "message": "Predict next month sales"
}
```

### Response

```json
{
  "response": "Sales are expected to increase by 12%",
  "charts": [],
  "insights": []
}
```

---

## Get Chat History

```http
GET /chat/history/{session_id}
```

---

## Delete Chat Session

```http
DELETE /chat/history/{session_id}
```

---

# 10. Insight APIs

---

## Generate Insights

```http
POST /datasets/{dataset_id}/insights
```

---

## Get Insights

```http
GET /datasets/{dataset_id}/insights
```

### Response

```json
[
  {
    "type": "trend",
    "title": "Revenue Growth",
    "description": "Revenue increased 15%"
  }
]
```

---

# 11. Forecast APIs

---

## Create Forecast

```http
POST /forecast/generate
```

### Request

```json
{
  "dataset_id": "uuid",
  "target_column": "sales",
  "horizon": 30
}
```

### Response

```json
{
  "forecast_id": "uuid",
  "status": "processing"
}
```

---

## Get Forecast

```http
GET /forecast/{forecast_id}
```

### Response

```json
{
  "model": "Prophet",
  "forecast": [],
  "metrics": {}
}
```

---

## Delete Forecast

```http
DELETE /forecast/{forecast_id}
```

---

# 12. AutoML APIs

---

## Start AutoML

```http
POST /automl/start
```

### Request

```json
{
  "dataset_id": "uuid",
  "target_column": "revenue"
}
```

---

### Response

```json
{
  "run_id": "uuid"
}
```

---

## Get AutoML Run

```http
GET /automl/{run_id}
```

### Response

```json
{
  "best_model": "XGBoost",
  "score": 0.94
}
```

---

## Get Leaderboard

```http
GET /automl/{run_id}/leaderboard
```

---

# 13. Model APIs

---

## Get Models

```http
GET /models
```

---

## Get Model

```http
GET /models/{model_id}
```

---

## Delete Model

```http
DELETE /models/{model_id}
```

---

# 14. Anomaly Detection APIs

---

## Run Detection

```http
POST /anomalies/detect
```

### Request

```json
{
  "dataset_id": "uuid"
}
```

---

## Get Results

```http
GET /anomalies/{run_id}
```

### Response

```json
{
  "total_anomalies": 15,
  "records": []
}
```

---

# 15. Report APIs

---

## Generate Report

```http
POST /reports/generate
```

### Request

```json
{
  "dataset_id": "uuid",
  "report_type": "executive"
}
```

---

### Response

```json
{
  "report_id": "uuid"
}
```

---

## Get Report

```http
GET /reports/{report_id}
```

---

## Download PDF

```http
GET /reports/{report_id}/pdf
```

---

## Download DOCX

```http
GET /reports/{report_id}/docx
```

---

## Delete Report

```http
DELETE /reports/{report_id}
```

---

# 16. Activity APIs

---

## Get Activity Log

```http
GET /activity
```

---

# 17. Notification APIs

---

## Get Notifications

```http
GET /notifications
```

---

## Mark Read

```http
PATCH /notifications/{notification_id}
```

---

# 18. Job APIs

Used for async tasks.

---

## Get Job Status

```http
GET /jobs/{job_id}
```

### Response

```json
{
  "status": "completed",
  "progress": 100
}
```

---

# 19. Search APIs

---

## Search Datasets

```http
GET /search/datasets?q=sales
```

---

## Search Reports

```http
GET /search/reports?q=revenue
```

---

# 20. Admin APIs (Future)

---

## Users

```http
GET /admin/users
```

---

## Datasets

```http
GET /admin/datasets
```

---

## Reports

```http
GET /admin/reports
```

---

# 21. Common Error Format

```json
{
  "success": false,
  "error": {
    "code": "DATASET_NOT_FOUND",
    "message": "Dataset does not exist"
  }
}
```

---

# 22. HTTP Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | Success          |
| 201  | Created          |
| 400  | Bad Request      |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not Found        |
| 409  | Conflict         |
| 422  | Validation Error |
| 429  | Rate Limited     |
| 500  | Server Error     |

---

# 23. Rate Limiting

### MVP

```text
100 requests/minute
```

---

### Premium

```text
500 requests/minute
```

---

# 24. WebSocket APIs (V2)

---

## Real-Time Job Updates

```text
/ws/jobs/{job_id}
```

---

## Real-Time Chat

```text
/ws/chat/{session_id}
```

---

# 25. API Versioning Strategy

Current:

```text
/api/v1
```

Future:

```text
/api/v2
/api/v3
```

Backward compatibility maintained for one major version.

---

# Final API Summary

```text
Authentication
      │
Datasets
      │
Profiling
      │
Cleaning
      │
EDA
      │
Dashboard
      │
Chat
      │
Insights
      │
Forecasting
      │
AutoML
      │
Reports
```

The API layer is designed to support web, mobile, third-party integrations, agent orchestration, and future enterprise-scale deployments while maintaining a clean RESTful architecture.