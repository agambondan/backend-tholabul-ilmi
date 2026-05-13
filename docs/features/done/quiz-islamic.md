# Quiz Islami Interaktif

Status: `DONE`
Priority: `P1`
Tanggal: `2026-05-13`

## Objective

Quiz interaktif 10 soal MCQ random dari berbagai topik keislaman dengan score tracking untuk menguji dan memperkuat pemahaman pengguna.

## Scope

- API: `/quiz`
- Web: `/quiz`, `/dashboard/quiz`
- Mobile: `ExploreScreen`

## Evidence

- Web: `apps/web/src/app/quiz/page.js`, `apps/web/src/app/dashboard/quiz/page.js`
- Mobile: `apps/mobile/src/screens/ExploreScreen.js`

- API: services/api/app/controllers/quiz_controller.go

## Source of Truth

- services/api/app/controllers/quiz_controller.go
- services/api/app/model/quiz.go
- services/api/app/services/quiz_service.go
