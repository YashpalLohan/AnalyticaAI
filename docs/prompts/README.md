# Prompts Directory

This folder contains all LLM prompt definitions for AnalyticaAI.

| File | Purpose |
|---|---|
| `system-prompts.md` | System-level prompts for each agent |
| `few-shot-examples.md` | Example inputs/outputs for consistency |

## Rules

1. Never edit a production prompt without creating a new version entry in the versioning log
2. Test every prompt change against at least 5 sample datasets before deploying
3. Keep prompts DRY — shared instructions go in the orchestrator, not repeated per agent
4. Prompts are code — review them like code in PRs
