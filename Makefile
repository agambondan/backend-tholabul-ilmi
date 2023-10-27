build:
	go build main.go -o weddinggo

cp-server:
	scp -o IdentitiesOnly=yes weddinggo agam@103.193.176.34:~/project/wedding-api

cp-cert:
	scp -o IdentitiesOnly=yes cert/* agam@103.193.176.34:~/project/cert

buildcp:
	go build -o weddinggo main.go
	scp -o IdentitiesOnly=yes weddinggo agam@103.193.176.34:~/project/wedding-api
