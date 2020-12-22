BIN = node_modules/.bin

.PHONY: bootstrap lint build

bootstrap:
	yarn

build:
	$(BIN)/ncc build index.js -o dist/

lint:
	$(BIN)/eslint --ext .ts,.js --ignore-path .eslintignore  . --fix
	#$(BIN)/standard


pin:
	pin-github-action .github/workflows/act.yml

commit: lint build 
	@git commit dist -m=$(m)

run:
	act  -P ubuntu-latest=keymetrics/pm2:latest-jessie -s SSH_PRIVATE_KEY="$(cat deploy.key)"