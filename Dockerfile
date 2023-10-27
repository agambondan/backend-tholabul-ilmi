# syntax=docker/dockerfile:1
#FROM golang:alpine
FROM golang:latest

RUN go env -w GO111MODULE=on
#RUN go env -w GOCACHE=OFF
#RUN go env -w GOPRIVATE=github.com/agambondan
RUN go env

WORKDIR /app

COPY . .

#RUN apk add git
#RUN git config --global url."https://agambondan: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@github.com".insteadOf / "https://github.com"
#RUN go get github.com/agambondan/islamic-explorer

RUN go mod download
#RUN go get github.com/agambondan/islamic-explorer

RUN go build -o ./build/main main.go

CMD ./build/main -environment production