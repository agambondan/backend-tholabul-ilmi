run-local:
	cd services/api && go run main.go

run-dev:
	cd services/api && go run main.go -environment development

seed-quran:
	cd services/api && go run ./scripts/seed_quran/main.go

seed-quran-dev:
	cd services/api && go run ./scripts/seed_quran/main.go -environment development

build-api:
	cd services/api && go build main.go -o weddinggo

build-web:
	cd apps/web && npm run build

build: build-api build-web

web-dev:
	cd apps/web && npm run dev

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

cp-server:
	scp -o IdentitiesOnly=yes services/api/weddinggo agam@103.193.176.34:~/project/wedding-api

cp-cert:
	scp -o IdentitiesOnly=yes services/api/cert/* agam@103.193.176.34:~/project/cert

buildcp:
	cd services/api && go build -o weddinggo main.go
	scp -o IdentitiesOnly=yes services/api/weddinggo agam@103.193.176.34:~/project/wedding-api
