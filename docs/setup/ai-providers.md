# AI Provider Setup

Keep AI provider notes and local setup at the monorepo level so backend and frontend agents share the same source of truth.

Recommended locations:

- `.chronicle/` for Chronicle project binding.
- `.codex/` for repo-local Codex guidance if needed.
- `AGENTS.md` for agent workflow rules.
- `docs/setup/` for human-readable setup and operational notes.

Do not duplicate provider configuration inside `apps/backend` and `apps/frontend` unless a service requires app-specific runtime credentials.
