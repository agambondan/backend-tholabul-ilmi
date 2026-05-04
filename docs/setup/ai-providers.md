# AI Provider Setup

Keep AI provider notes and local setup at the monorepo level so service and app agents share the same source of truth.

Recommended locations:

- `.chronicle/` for Chronicle project binding.
- `.codex/` for repo-local Codex guidance if needed.
- `AGENTS.md` for agent workflow rules.
- `docs/setup/` for human-readable setup and operational notes.

Do not duplicate provider configuration inside `services/api` and `apps/web` unless a runtime unit requires app-specific credentials.
