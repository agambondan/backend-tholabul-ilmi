run-local:
	cd apps/backend && go run main.go

run-dev:
	cd apps/backend && go run main.go -environment development

seed-quran:
	cd apps/backend && go run ./scripts/seed_quran/main.go

seed-quran-dev:
	cd apps/backend && go run ./scripts/seed_quran/main.go -environment development

build-backend:
	cd apps/backend && go build main.go -o weddinggo

build-frontend:
	cd apps/frontend && npm run build

build: build-backend build-frontend

frontend-dev:
	cd apps/frontend && npm run dev

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

cp-server:
	scp -o IdentitiesOnly=yes apps/backend/weddinggo agam@103.193.176.34:~/project/wedding-api

cp-cert:
	scp -o IdentitiesOnly=yes apps/backend/cert/* agam@103.193.176.34:~/project/cert

buildcp:
	cd apps/backend && go build -o weddinggo main.go
	scp -o IdentitiesOnly=yes apps/backend/weddinggo agam@103.193.176.34:~/project/wedding-api
