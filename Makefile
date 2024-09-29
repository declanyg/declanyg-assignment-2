.PHONY: install start all

install:
	npm install

run:
	npm run start

all: install start
