# Few-Shot Examples for Agent Prompts

Version: 1.0

These examples are injected into agent prompts to improve output quality and consistency.

---

## Chat Agent — Few-Shot Examples

### Example 1: Aggregation Query

**User:** Which product generated the most revenue?

**Response:**
```json
{
  "answer": "Product A generated the highest revenue at $142,500, accounting for 28% of total revenue. It outperformed Product B ($98,200) and Product C ($76,400) by a significant margin.",
  "chart": {
    "chart_type": "bar",
    "title": "Revenue by Product",
    "x_column": "product",
    "y_column": "revenue"
  },
  "table": null,
  "follow_up_suggestions": [
    "Which region sold the most of Product A?",
    "How did Product A perform over time?",
    "What is the profit margin for Product A?"
  ]
}
```

---

### Example 2: Trend Query

**User:** Why did sales decline in March?

**Response:**
```json
{
  "answer": "Sales declined 18% in March compared to February. The drop was primarily driven by a 34% decrease in the Electronics category, which fell from $45,000 to $29,700. Clothing and Accessories remained stable. The decline coincides with reduced order volume from the North region.",
  "chart": {
    "chart_type": "line",
    "title": "Monthly Sales Trend",
    "x_column": "month",
    "y_column": "sales"
  },
  "table": null,
  "follow_up_suggestions": [
    "Which customers reduced their orders in March?",
    "Show me sales by region for Q1",
    "Compare March performance year-over-year"
  ]
}
```

---

### Example 3: Impossible Query

**User:** What will the weather be tomorrow?

**Response:**
```json
{
  "answer": "I can only answer questions about your uploaded dataset. This dataset contains sales and customer data, so I'm not able to provide weather information. Try asking about sales trends, top customers, or revenue breakdowns.",
  "chart": null,
  "table": null,
  "follow_up_suggestions": [
    "What are the top 10 customers by revenue?",
    "Show me the sales trend for the last 6 months",
    "Which product category has the highest profit margin?"
  ]
}
```

---

## Insight Agent — Few-Shot Examples

### Example 1: Risk Insight

**Input:** Revenue dropped 12% month-over-month. Customer churn increased 8%.

**Response:**
```json
{
  "type": "risk",
  "title": "Revenue Decline — Immediate Attention Required",
  "description": "Revenue has dropped 12% month-over-month, coinciding with an 8% rise in customer churn. If this trend continues, projected Q4 revenue could fall below target by 30-35%.",
  "severity": "high",
  "supporting_data": "Revenue: $89,200 (current) vs $101,400 (previous month)"
}
```

---

### Example 2: Opportunity Insight

**Input:** North region growing at 22% while other regions are flat.

**Response:**
```json
{
  "type": "opportunity",
  "title": "North Region Outperforming — Scale Investment",
  "description": "The North region is growing at 22% while all other regions are flat or declining. Increasing marketing spend and sales resources in this region could meaningfully accelerate overall growth.",
  "severity": "medium",
  "supporting_data": "North region: +22% MoM. East: +1%. West: -2%. South: +0.5%."
}
```

---

## Cleaning Agent — Few-Shot Examples

### Example: Mixed Dataset

**Input:** 10,000 rows. Age column: 12% missing. City column: 3% missing. Salary: 0.5% missing. 45 duplicate rows.

**Response:**
```json
{
  "missing_value_strategy": {
    "age": "median",
    "city": "mode",
    "salary": "mean"
  },
  "remove_duplicates": true,
  "outlier_strategy": "cap",
  "health_score_after_cleaning": 96,
  "summary": "Imputing missing Age with median (robust to outliers), City with mode (most common city), and Salary with mean. Removing 45 duplicate rows. Capping salary outliers at the 99th percentile rather than removing to preserve data volume."
}
```
