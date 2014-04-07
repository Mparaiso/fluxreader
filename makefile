src="src/."
destination="build/"
bin="bin/"
commit:
	@git add .
	@git commit -am"$(message) `date`"
push: commit
	@git push origin master --tags
push-pages: commit
	@git push origin gh-pages --tags
build:
	@cp -Rvu $(src) $(destination)
install:
	@npm install
	@bower install -pS
help:
	@echo "HELP"
	@echo "===="
	@echo "Commands:"
	@echo "---------"
	@echo "build: build project"
	@echo "start: start test server"
	@echo "install: install npm modules and bower components"
start:
	@node $(bin)/server.js ./ &
.PHONY: build start help push commit