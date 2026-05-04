# Local Development

## Full Stack

```bash
make docker-up
```

The compose file builds:

- Backend from `apps/backend`
- Frontend from `apps/frontend`

Default local ports:

- Backend API: `http://localhost:29900`
- Frontend: `http://localhost:23000`
- Postgres: `localhost:54320`
- Redis: `localhost:63790`

## Backend

```bash
make run-local
```

## Frontend

```bash
make frontend-dev
```
