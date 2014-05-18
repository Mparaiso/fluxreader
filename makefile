besrc="src/."
destination="build/"
bin="bin/"
test:
	@karma start test/karma.conf.js  &
commit:
	@git add .
	@git commit -am"$(message) `date`" | :
push: commit
	@git push origin master
push-pages: commit
	@git push origin gh-pages
build:
	@cp -Rvu $(src) $(destination)
install:
	@npm install
	@bower install -pS
start:
	@node $(bin)/server.js ./ &
.PHONY: build start help push commit test
