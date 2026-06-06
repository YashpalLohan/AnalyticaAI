# Contributing to AnalyticaAI

Thanks for taking the time to contribute. Here's how to get set up and what to follow.

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YashpalLohan/AnalyticaAI.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Push and open a pull request against `develop`

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/name` | `feature/ai-chat` |
| Bug fix | `fix/name` | `fix/upload-validation` |
| Hotfix | `hotfix/name` | `hotfix/jwt-expiry` |
| Docs | `docs/name` | `docs/readme-update` |

---

## Commit Messages

Use conventional commits:

```
feat: add dataset profiling endpoint
fix: handle empty CSV uploads
docs: update README setup steps
refactor: extract chat service logic
test: add unit tests for cleaning agent
chore: update dependencies
```

---

## Code Standards

### Backend (Python)

- Follow PEP 8
- Use type hints on all functions
- All endpoints must have docstrings
- Use Pydantic models for all request/response schemas
- Never hardcode secrets — use environment variables

### Frontend (TypeScript)

- No `any` types
- Components go in `src/components/`
- Feature logic goes in `src/features/`
- API calls go through `src/services/`
- Use React Hook Form + Zod for all forms

---

## Pull Request Checklist

Before opening a PR:

- [ ] Code runs locally without errors
- [ ] No secrets or `.env` files committed
- [ ] Relevant tests added or updated
- [ ] API changes reflected in `08-API-Specification.md`
- [ ] Database changes have an Alembic migration

---

## Reporting Bugs

Open a GitHub issue with:

- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshot or error log if possible

---

## Questions

Open a GitHub discussion or reach out directly.
