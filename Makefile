run-local:
	cd services/api && go run main.go

run-dev:
	cd services/api && go run main.go -environment development

seed-quran:
	cd services/api && go run ./scripts/seed_quran/main.go

seed-quran-dev:
	cd services/api && go run ./scripts/seed_quran/main.go -environment development

seed-quran-docker:
	cd services/api && DB_PORT=54320 go run ./scripts/seed_quran/main.go

seed-tafsir:
	cd services/api && go run ./cmd/seed_tafsir/main.go

seed-tafsir-dev:
	cd services/api && go run ./cmd/seed_tafsir/main.go -environment development

seed-tafsir-docker:
	cd services/api && DB_HOST=localhost DB_PORT=54320 DB_USER=postgres DB_PASS=postgres DB_NAME=thullabul_ilmi go run ./cmd/seed_tafsir/main.go -environment container

build-api:
	cd services/api && go build main.go -o weddinggo

build-web:
	cd apps/web && npm run build

build: build-api build-web

web-dev:
	cd apps/web && npm run dev

mobile-start:
	cd apps/mobile && npm run start

mobile-android:
	cd apps/mobile && npm run android

mobile-ios:
	cd apps/mobile && npm run ios

mobile-web:
	cd apps/mobile && npm run web

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

expo-android:
	cd apps/mobile && ANDROID_HOME=$(HOME)/.local/share/android-sdk PATH="$$PATH:$(HOME)/.local/share/android-sdk/platform-tools" npx expo start --android