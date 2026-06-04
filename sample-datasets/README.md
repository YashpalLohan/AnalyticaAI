# Sample Datasets

Use these CSV files to test the platform during development.

| File | Description | Rows | Use Case |
|---|---|---|---|
| `sales_data.csv` | Product sales with region, category, revenue, profit | 30 | Profiling, EDA, dashboard, chat, insights |
| `customer_data.csv` | Customer records with intentional missing values | 15 | Cleaning suggestions, profiling, segmentation |

## What to Test With Each

### `sales_data.csv`
- Profiling: row/column counts, data types, health score
- EDA: revenue by region bar chart, category pie chart, sales trend line
- Chat: "Which product generates the most revenue?", "Compare regions"
- Dashboard: KPI cards for total sales, profit, quantity
- Insights: top product, best region, profit margin

### `customer_data.csv`
- Missing values: `city` missing for C012, `age` missing for C013
- Cleaning suggestions: fill missing city with mode, fill age with median
- Segmentation: active vs inactive customers
- Chat: "Who are the top 5 customers by spending?"
