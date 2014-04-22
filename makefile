src="src/."
destination="build/"
bin="bin/"
test:
	@karma start test/karma.conf.js  &
commit:
	@git add .
	@git commit -am"$(message) `date`" | :
push: commit
	@git push origin --tags
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
	@echo "test: start karma js test runner"
	@echo "push-pages : push to github pages"
start:
	@node $(bin)/server.js ./ &
.PHONY: build start help push commit test
