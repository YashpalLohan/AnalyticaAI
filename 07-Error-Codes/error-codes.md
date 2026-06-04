# API Error Code Registry

Version: 1.0

All API errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

---

## Authentication Errors (AUTH_*)

| Code | HTTP Status | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password is incorrect |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT access token has expired |
| `AUTH_TOKEN_INVALID` | 401 | JWT token is malformed or tampered |
| `AUTH_REFRESH_TOKEN_EXPIRED` | 401 | Refresh token has expired — re-login required |
| `AUTH_USER_NOT_FOUND` | 404 | No account found with this email |
| `AUTH_EMAIL_ALREADY_EXISTS` | 409 | An account with this email already exists |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email address not verified |
| `AUTH_INSUFFICIENT_PERMISSIONS` | 403 | User does not have required permissions |

---

## Dataset Errors (DATASET_*)

| Code | HTTP Status | Description |
|---|---|---|
| `DATASET_NOT_FOUND` | 404 | Dataset does not exist or was deleted |
| `DATASET_UPLOAD_FAILED` | 500 | File upload to storage failed |
| `DATASET_FORMAT_UNSUPPORTED` | 400 | File format not supported (only CSV, XLSX, JSON) |
| `DATASET_TOO_LARGE` | 400 | File exceeds 100MB limit |
| `DATASET_EMPTY` | 400 | Uploaded file contains no data rows |
| `DATASET_CORRUPTED` | 400 | File cannot be read or is corrupted |
| `DATASET_DUPLICATE` | 409 | A dataset with this name already exists |
| `DATASET_PROCESSING` | 409 | Dataset is currently being processed — try again shortly |

---

## Profiling Errors (PROFILE_*)

| Code | HTTP Status | Description |
|---|---|---|
| `PROFILE_NOT_FOUND` | 404 | No profile generated for this dataset yet |
| `PROFILE_GENERATION_FAILED` | 500 | Profiling engine encountered an error |
| `PROFILE_IN_PROGRESS` | 409 | Profiling is still running |

---

## Cleaning Errors (CLEANING_*)

| Code | HTTP Status | Description |
|---|---|---|
| `CLEANING_FAILED` | 500 | Cleaning operation failed |
| `CLEANING_INVALID_STRATEGY` | 400 | Specified strategy is not valid for this column type |

---

## EDA Errors (EDA_*)

| Code | HTTP Status | Description |
|---|---|---|
| `EDA_NOT_FOUND` | 404 | No EDA results found for this dataset |
| `EDA_GENERATION_FAILED` | 500 | EDA engine failed |
| `EDA_IN_PROGRESS` | 409 | EDA is still running |

---

## Dashboard Errors (DASHBOARD_*)

| Code | HTTP Status | Description |
|---|---|---|
| `DASHBOARD_NOT_FOUND` | 404 | Dashboard does not exist |
| `DASHBOARD_GENERATION_FAILED` | 500 | Could not generate dashboard |
| `DASHBOARD_INVALID_LAYOUT` | 400 | Layout configuration is invalid |

---

## Chat Errors (CHAT_*)

| Code | HTTP Status | Description |
|---|---|---|
| `CHAT_SESSION_NOT_FOUND` | 404 | Chat session does not exist |
| `CHAT_QUERY_FAILED` | 500 | AI query processing failed |
| `CHAT_CONTEXT_UNAVAILABLE` | 400 | Dataset context not ready — run profiling first |
| `CHAT_RATE_LIMITED` | 429 | Too many chat requests — slow down |

---

## Forecast Errors (FORECAST_*)

| Code | HTTP Status | Description |
|---|---|---|
| `FORECAST_NOT_FOUND` | 404 | Forecast does not exist |
| `FORECAST_INSUFFICIENT_DATA` | 400 | Not enough historical data (minimum 30 rows required) |
| `FORECAST_NO_DATE_COLUMN` | 400 | No date/time column detected in dataset |
| `FORECAST_GENERATION_FAILED` | 500 | Forecasting model training or prediction failed |
| `FORECAST_IN_PROGRESS` | 409 | Forecast is still being generated |

---

## AutoML Errors (AUTOML_*)

| Code | HTTP Status | Description |
|---|---|---|
| `AUTOML_RUN_NOT_FOUND` | 404 | AutoML run does not exist |
| `AUTOML_TARGET_NOT_FOUND` | 400 | Target column not found in dataset |
| `AUTOML_INSUFFICIENT_DATA` | 400 | Not enough data rows for model training (minimum 100 required) |
| `AUTOML_TRAINING_FAILED` | 500 | Model training failed |
| `AUTOML_IN_PROGRESS` | 409 | AutoML run is still in progress |

---

## Report Errors (REPORT_*)

| Code | HTTP Status | Description |
|---|---|---|
| `REPORT_NOT_FOUND` | 404 | Report does not exist |
| `REPORT_GENERATION_FAILED` | 500 | Report generation failed |
| `REPORT_INVALID_TYPE` | 400 | Report type is not valid |
| `REPORT_IN_PROGRESS` | 409 | Report is still being generated |

---

## General Errors (GENERAL_*)

| Code | HTTP Status | Description |
|---|---|---|
| `GENERAL_VALIDATION_ERROR` | 422 | Request body failed validation |
| `GENERAL_NOT_FOUND` | 404 | Resource not found |
| `GENERAL_RATE_LIMITED` | 429 | Rate limit exceeded |
| `GENERAL_SERVER_ERROR` | 500 | Unexpected server error |
| `GENERAL_SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `GENERAL_CONFLICT` | 409 | Resource state conflict |

---

## Job Errors (JOB_*)

| Code | HTTP Status | Description |
|---|---|---|
| `JOB_NOT_FOUND` | 404 | Background job does not exist |
| `JOB_FAILED` | 500 | Background job failed |
| `JOB_TIMEOUT` | 504 | Job exceeded time limit |
