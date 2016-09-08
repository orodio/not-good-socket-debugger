all:
	deploy

build:
	npm run build

deploy: build
	surge --project=build/ --domain=sockets.surge.sh
