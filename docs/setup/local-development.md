# Local Development

## Full Stack

```bash
make docker-up
```

The compose file builds:

- API service from `services/api`
- Web app from `apps/web`

Default local ports:

- Backend API: `http://localhost:29900`
- Frontend: `http://localhost:23000`
- Postgres: `localhost:54320`
- Redis: `localhost:63790`

## API Service

```bash
make run-local
```

## Web App

```bash
make web-dev
```
