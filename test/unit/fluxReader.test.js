/*jslint eqeq:true,node:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global fluxreader,window,spyOn,describe,jasmine,beforeEach,it,expect,angular,module,inject*/

"use strict";
describe('fluxreader', function () {
    beforeEach(function () {
        var self = this;
        angular.module('test', ['fluxReader', 'dropboxDatabase', 'pagination', 'dropbox.mock', 'googleFeed.mock'])
        .config(function (feedFinderProvider, $provide) {
            feedFinderProvider.setGoogle({
                load: function () {
                    return;
                }
            });
        })
        .constant('Table',fluxreader.TableStub)
        .service('FolderProxy',fluxreader.FolderProxy)
        .constant('forceHTTPS', false);
        module('test');
        inject(function ($window, $timeout, $rootScope, $injector, $controller,$httpBackend,$q) {
            this.$timeout = $timeout;
            this.$injector = $injector;
            this.$window = $window;
            this.$controller = $controller;
            this.$rootScope = $rootScope;
            this.$scope = $rootScope.$new();
            this.$q=$q;
            this.$httpBackend=$httpBackend;
            spyOn($window, 'prompt');
            spyOn($window, 'alert');
            spyOn($window, 'confirm');
            $httpBackend.when('GET', '/templates/index.html').respond("");
        });
    });
    it('should run properly', inject(function (baseUrl) {
        expect(baseUrl).toBeDefined();
    }));
    describe('MainCtrl', function () {
        beforeEach(function () {
            this.$scope = this.$rootScope.$new();
            this.MainCtrl = this.$controller('MainCtrl', {$scope: this.$scope});
        });
        it('ok', function () {
            this.$scope.isAuthenticated();
            this.$scope.signOut();
            this.$scope.signIn();
        });
    });
    describe('IndexCtrl', function () {
        beforeEach(function () {
            this.$scope = this.$rootScope.$new();
            this.IndexCtrl = this.$controller('IndexCtrl', {$scope: this.$scope});
        });
        it('when', function () {
        });
    });
    describe('SignInCtrl', function () {
        beforeEach(function () {

            this.SignInCtrl = this.$controller('SignInCtrl', {$scope: this.$scope});
        });
        it('when', function () {
            expect(this.SignInCtrl).toBeDefined();
        });
    });
    describe('SearchCtrl', function () {
        beforeEach(function () {
            this.query = "foo";
            this.SearchCtrl = this.$controller('SearchCtrl', {$scope: this.$scope, query: this.query});
        });
        it('when', function () {
            expect(this.SearchCtrl).toBeDefined();
        });
    });
    describe('SearchFormCtrl', function () {
        beforeEach(function () {
            this.SearchFormCtrl = this.$controller('SearchFormCtrl', {$scope: this.$scope});
        });
        it('when', function () {
            this.$scope.q = "feed";
            this.$scope.search();
        });
    });
    describe('FolderCtrl',function(){
        beforeEach(inject(function(FolderProxy){
            this.FolderProxy=FolderProxy;
            this.FolderProxy.folders=[{id:0,title:"foobar"}];
            this.FolderProxy.dirty=false;
            this.scope=this.$rootScope.$new();
            this.route={current:{params:{id:0}}};
            this.FolderCtrl=this.$controller('FolderCtrl',{$scope:this.scope,$route:this.route});
            this.$rootScope.$apply();
            this.$timeout.flush();
        }));
        it('when',function(){
            expect(this.scope.pageTitle).toContain('foobar');
        });
    });
    describe('FeedCtrl', function () {
        beforeEach(function () {
            this.$scope.feed = {title: "foo"};
            this.FeedProxy = this.$injector.get('FeedProxy');
            this.$q = this.$injector.get('$q');
            spyOn(this.FeedProxy, 'subscribe').and.callThrough();
            this.FeedCtrl = this.$controller('FeedCtrl', {$scope: this.$scope, $route: {current: {params: {id: 0}}}});
        });
        it('#refresh', function () {
            var url = "http://foo.fr";
            this.$scope.refresh(url);
            expect(this.FeedProxy.subscribe).toHaveBeenCalledWith(url);
        });
    });
    describe('FeedListCtrl', function () {
        beforeEach(inject(function ($controller, $injector) {
            this.FeedProxy=$injector.get('FeedProxy');
            this.Entry=$injector.get('Entry');
            this.Feed=$injector.get('Feed');
            this.Notification=$injector.get('Notification');
            this.feed = {id: 'foo', title: 'bar',open:true,entries:[]};
            this.scope = $injector.get('$rootScope').$new();
            this.FeedListCtrl = $controller('FeedListCtrl', {$scope: this.scope});
        }));
        beforeEach(function (done) {
            this.FeedProxy.insert(this.feed).then(done);
            this.$rootScope.$apply();
            this.$timeout.flush();
        });
        it('#watches FeedProxy.feeds',function(done){
            var self=this;
            this.FeedProxy.load(true).then(done);
        });
        it('#unsubscribe', function () {
            this.$window.confirm.and.returnValue(true);
            this.scope.unsubscribe(this.feed);
            expect(this.$window.confirm).toHaveBeenCalled();
        });
    });
    describe('SubscribeCtrl', function () {
        beforeEach( inject(function ($controller, $window, Feed) {
            this.scope = {};
            this.Feed = Feed;
            this.SubscribeCtrl = $controller('SubscribeCtrl', {$scope: this.scope});
        }));

        it('#subscribe', function () {
            spyOn(this.Feed, 'subscribe');
            this.$window.prompt.and.returnValue('http://testFeed');
            this.scope.subscribe();
            expect(this.$window.prompt).toHaveBeenCalled();
            expect(this.Feed.subscribe).toHaveBeenCalled();
        });
    });
    describe('DashboardCtrl', function () {
        beforeEach(inject(function ($controller, $window) {
            this.feed = {id: 'foo', title: 'title'};
            this.scope = {};
            this.$window = $window;
            this.DashboardCtrl = $controller('DashboardCtrl', {'$scope': this.scope});
        }));
        it('$scope', function () {
            expect(this.scope.pageTitle).toBeDefined();
        });
    });
    describe('AccountCtrl', function () {
        beforeEach(function () {
            this.dropboxClient = this.$injector.get('dropboxClient');
            spyOn(this.dropboxClient, "getAccountInfo");
            this.AccountCtrl = this.$controller('AccountCtrl', {$scope: this.$scope});
        });
        describe('#export',function  () {
            it('executes',function(){
                this.$scope.export();
            });
        });
        describe('#import',function(){
            beforeEach(function  () {
                this.fileList = [{}];
                this.event={};
            });
            it('should execute',function(){
                this.$scope.import(this.event,this.fileList);
                this.$httpBackend.flush();
                this.$scope.$apply();
            });
        });
        describe('#refresh', function () {
            beforeEach(function () {
                var self = this;
                this.feeds = [
                    {refreshAt: 0},
                    {refreshedAt: Date.now()}
                ];
                this.Feed = this.$injector.get('Feed');
                this.globals = this.$injector.get('globals');
                spyOn(this.Feed, "findAll").and.callFake(function (cb) {
                    cb(null, self.feeds);
                });
                spyOn(this.Feed, "subscribe").and.callFake(function (url, next) {
                    next();
                });
            });
            it('#refresh', function () {
                this.$scope.refresh();
                expect(this.Feed.findAll).toHaveBeenCalled();
            });
        });
    });
    describe('EntryCtrl', function () {
        beforeEach(inject(function ($controller, Entry, FeedProxy, Notification) {
            this.entry = {};
            this.scope = {};
            this.entry = {title: 'foo', favorite: false};
            this.Entry = Entry;
            this.route = {current: {params: {id: 'foo'}}};
            spyOn(this.Entry, 'toggleFavorite');
            spyOn(this.Entry, 'getById').and.callFake(function (id, cb) {
                return cb(undefined, this.entry);
            }.bind(this));
            this.EntryCtrl = $controller('EntryCtrl', {$scope: this.scope, $route: this.route});
        }));
        it('#toggleFavorite', function () {
            expect(this.Entry.getById).toHaveBeenCalled();
            this.scope.toggleFavorite();
            expect(this.Entry.toggleFavorite).toHaveBeenCalled();
        });
        it('#delete',function(){
            this.scope.delete({});
        });
        it('#Entry.getById',function(){
            this.$timeout.flush();
            expect(this.scope.entry).toBe(this.entry);
        });
    });
    describe('EntryListCtrl', function () {
        beforeEach(function () {
            this.EntryListCtrl = this.$controller('EntryListCtrl', {$scope: this.$scope});
            this.EntryProxy=this.$injector.get('EntryProxy');
            this.Notification=this.$injector.get('Notification');
        });
        it('#toggleFavorite', function () {
            this.$scope.toggleFavorite();
            this.$scope.predicate({publishedDate: new Date()});
        });
        it('#removeEntry',function () {
            var self=this;
            spyOn(this.Notification,'notify');
            spyOn(this.EntryProxy,'delete').and.callFake(function(entry){
                return self.$q.when(entry);
            });
            this.$scope.removeEntry.bind({entry:{title:""}})();
            this.$scope.$apply();
            expect(this.EntryProxy.delete).toHaveBeenCalled();
            expect(this.Notification.notify).toHaveBeenCalled();
        });
        it('#next',function () {
            this.$scope.next();
        });
        it('#previous',function () {
            this.$scope.previous();
        });
        it('#hasPrevious',function () {
            this.$scope.hasPrevious();
        });
        it('#hasNext',function () {
            this.$scope.hasNext();
        });
    });
    describe('UnreadCtrl', function () {
        beforeEach(function () {
            this.UnreadCtrl = this.$controller('UnreadCtrl', {$scope: this.$scope});
        });
        it('pageTitle', function () {
            expect(this.$scope.pageTitle).toBe("Unread entries");
        });
    });
    describe('Link', function () {
        it('exists', function () {
            this.Link = this.$injector.get('Link');
            expect(this.Link).toBeDefined();
        });
    });
});

