BIN = node_modules/.bin

.PHONY: bootstrap lint build

bootstrap:
	yarn

build:
	$(BIN)/ncc build index.js -o dist/

lint:
	$(BIN)/standard


pin:
	pin-github-action .github/workflows/selkf.yml
