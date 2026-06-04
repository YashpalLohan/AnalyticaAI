# 07-UI-UX-Brief.md

# AI Data Analyst Agent

## UI/UX Design Brief

Version: 1.0

---

# 1. Design Vision

## Core Principle

The platform should feel like:

**ChatGPT + Notion + Stripe Dashboard + Power BI**

combined into a single modern experience.

Users should feel that:

* AI is doing most of the work
* Data analysis is simple
* Complex analytics are approachable
* Everything is visually clean and professional

---

# 2. Design Goals

### Goal 1

Reduce complexity of data analytics.

---

### Goal 2

Make AI the primary interaction model.

---

### Goal 3

Enable users to obtain insights within 60 seconds of uploading a dataset.

---

### Goal 4

Maintain enterprise-grade visual quality.

---

# 3. Design Style

## Visual Personality

Modern

Minimal

Professional

Data-centric

AI-first

---

## Design Inspiration

* ChatGPT
* Notion
* Linear
* Stripe Dashboard
* Vercel
* Perplexity
* Power BI
* Tableau

---

# 4. Color System

## Light Mode

### Background

```css
#FFFFFF
```

---

### Secondary Background

```css
#F8FAFC
```

---

### Border

```css
#E2E8F0
```

---

### Text Primary

```css
#0F172A
```

---

### Text Secondary

```css
#64748B
```

---

### Primary Accent

```css
#2563EB
```

---

### Success

```css
#16A34A
```

---

### Warning

```css
#EA580C
```

---

### Error

```css
#DC2626
```

---

# 5. Typography

## Font Family

Primary:

```text
Inter
```

---

Fallback:

```text
System Sans
```

---

## Heading Scale

H1

48px

---

H2

36px

---

H3

28px

---

H4

22px

---

Body

16px

---

Small

14px

---

# 6. Layout System

## Grid

12-column grid

---

## Maximum Width

```text
1440px
```

---

## Content Width

```text
1280px
```

---

## Spacing Scale

```text
4
8
12
16
24
32
48
64
```

---

# 7. Navigation Structure

```text
Dashboard
│
├── Datasets
├── Dashboards
├── Reports
├── Chat
├── Models
├── History
├── Settings
└── Billing
```

---

# 8. Main User Flow

```text
Landing Page
      ↓
Authentication
      ↓
Dashboard
      ↓
Upload Dataset
      ↓
AI Processing
      ↓
Insights Dashboard
      ↓
Chat With Data
      ↓
Reports & Forecasts
```

---

# 9. Landing Page

## Sections

### Hero Section

Large headline

Example:

```text
Talk To Your Data.
Get Insights In Seconds.
```

---

### Upload Demo

Interactive upload widget.

---

### Features

* AI Analysis
* Forecasting
* AutoML
* Reports

---

### Testimonials

---

### Pricing

---

### Footer

---

# 10. Authentication Screens

## Login

Fields:

* Email
* Password

Buttons:

* Login
* Continue with Google

---

## Sign Up

Fields:

* Name
* Email
* Password

---

# 11. Main Dashboard

## Purpose

Central workspace.

---

## Layout

```text
┌─────────────────────────┐
│ Navbar                  │
├───────┬─────────────────┤
│Sidebar│ Main Content    │
│       │                 │
└───────┴─────────────────┘
```

---

# 12. Sidebar

Sections:

```text
Dashboard
Datasets
Chat
Reports
Models
History
Settings
```

---

# 13. Dashboard Home

## Top Section

Welcome card.

---

## KPI Cards

```text
Datasets
Reports
Forecasts
Models
```

---

## Recent Activity

Recent datasets.

---

## Quick Actions

```text
Upload Dataset
Create Report
Open Chat
Build Forecast
```

---

# 14. Dataset Upload Screen

## Drag and Drop Area

Large upload zone.

---

## States

### Empty

Upload prompt.

---

### Uploading

Progress indicator.

---

### Completed

Success animation.

---

# 15. Dataset Workspace

The most important screen.

---

## Layout

```text
┌────────────────────────────┐
│ Dataset Header             │
├────────────────────────────┤
│ Tabs                       │
├────────────────────────────┤
│ Overview                   │
│ Cleaning                   │
│ EDA                        │
│ Dashboard                  │
│ Forecasts                  │
│ Reports                    │
└────────────────────────────┘
```

---

# 16. Dataset Overview Tab

Display:

* Rows
* Columns
* Missing Values
* Duplicate Rows
* Dataset Health Score

---

## Health Score Card

```text
92 / 100
Healthy Dataset
```

---

# 17. Cleaning Screen

## Purpose

Show cleaning recommendations.

---

## Example

```text
Missing Values Found
Suggested Fix: Median
```

---

Buttons:

* Apply Fix
* Ignore

---

# 18. EDA Screen

Auto-generated analysis.

---

## Components

### Correlation Heatmap

Large card.

---

### Distribution Charts

Grid layout.

---

### Category Analysis

Bar charts.

---

### Time-Series Analysis

Line charts.

---

# 19. Dashboard Screen

AI-generated dashboard.

---

## Layout

```text
┌────┬────┬────┐
│KPI │KPI │KPI │
├────┴────┴────┤
│ Revenue Trend│
├──────────────┤
│ Category Pie │
├──────────────┤
│ Data Table   │
└──────────────┘
```

---

## User Actions

* Resize widget
* Remove widget
* Add widget
* Export dashboard

---

# 20. AI Chat Screen

Most frequently used feature.

---

## Layout

```text
┌──────────────────────────┐
│ Dataset Context Header   │
├──────────────────────────┤
│ Conversation Area        │
│                          │
│                          │
├──────────────────────────┤
│ Chat Input               │
└──────────────────────────┘
```

---

# 21. Chat UX

## Suggested Prompts

```text
What caused revenue decline?
Forecast next month sales.
Find anomalies.
Show top customers.
```

---

## AI Responses

Can contain:

* Text
* Tables
* Charts
* KPIs
* Forecasts

---

# 22. Forecast Screen

## Components

### Model Summary

```text
Best Model:
XGBoost
```

---

### Metrics

```text
MAE
RMSE
MAPE
```

---

### Forecast Graph

Large visualization.

---

### Confidence Interval

Displayed visually.

---

# 23. Reports Screen

## Reports List

* Executive Report
* Technical Report
* Forecast Report

---

## Report Card

```text
Report Name
Created Date
Download PDF
Download DOCX
```

---

# 24. AutoML Screen

## Model Cards

```text
Random Forest
Score: 91%
```

```text
XGBoost
Score: 94%
```

```text
LightGBM
Score: 92%
```

---

## Best Model Badge

```text
Recommended
```

---

# 25. History Screen

Shows:

* Previous chats
* Reports
* Generated dashboards
* Forecasts

---

# 26. Empty States

Example:

```text
No Dataset Uploaded Yet

Upload a CSV file to begin.
```

---

# 27. Loading States

Examples:

```text
Analyzing Dataset...
```

```text
Generating Dashboard...
```

```text
Training Model...
```

---

# 28. Error States

Example:

```text
Forecast could not be generated.

Reason:
Not enough historical data.
```

---

# 29. Mobile Experience

Priority:

### View Dashboard

Supported

### Chat

Supported

### Upload

Supported

### Dashboard Editing

Limited

---

# 30. Accessibility Requirements

* Keyboard navigation
* Screen reader support
* Proper contrast ratios
* Accessible charts

---

# 31. UX Principles

## Principle 1

AI should proactively help.

---

## Principle 2

Show insights before users ask.

---

## Principle 3

One-click actions wherever possible.

---

## Principle 4

Avoid technical jargon.

---

## Principle 5

Always explain AI decisions.

---

# 32. Desired User Experience

The user uploads a dataset and within one minute receives:

* Dataset health score
* Cleaning suggestions
* Automated visualizations
* Dashboard
* Insights
* Forecast opportunities

without writing code, SQL, or configuring charts.

This should feel like having a personal AI data analyst available on demand.
