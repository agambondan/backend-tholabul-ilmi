# Tholabul Ilmi

Monorepo for the Tholabul Ilmi backend and frontend applications.

## Layout

- `apps/backend` - Go/Fiber API service.
- `apps/frontend` - Next.js frontend.
- `docs` - Project documentation, setup notes, and task handoffs.
- `.chronicle` - Chronicle project binding for the monorepo root.

## Local Development

Run the full stack with Docker:

```bash
make docker-up
```

Run backend only:

```bash
make run-local
```

Run frontend only:

```bash
make frontend-dev
```
