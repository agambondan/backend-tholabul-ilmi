# Tholabul Ilmi

Monorepo for the Tholabul Ilmi API service and web application.

## Layout

- `services/api` - Go/Fiber API service.
- `apps/web` - Next.js website.
- `docs` - Project documentation, setup notes, and task handoffs.
- `.chronicle` - Chronicle project binding for the monorepo root.

## Local Development

Run the full stack with Docker:

```bash
make docker-up
```

Run API service only:

```bash
make run-local
```

Run web app only:

```bash
make web-dev
```
