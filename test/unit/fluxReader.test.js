/*jslint eqeq:true,node:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global window,spyOn,describe,jasmine,beforeEach,it,expect,angular,module,inject*/


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
            }).constant('forceHTTPS', false);
        module('test');
        inject(function ($window, $timeout, $rootScope, $injector, $controller) {
            self.$timeout = $timeout;
            self.$injector = $injector;
            self.$window = $window;
            self.$controller = $controller;
            self.$rootScope = $rootScope;
            self.$scope = $rootScope.$new();

            spyOn($window, 'prompt');
            spyOn($window, 'alert');
            spyOn($window, 'confirm');
            //spyOn($window,'scrollTo');
            //self.=function(){};
        });
    });
    it('should run properly', function () {
        inject(function (baseUrl) {
            expect(baseUrl).toBeDefined();
        });
    });
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
    describe('FeedCtrl', function () {
        beforeEach(function () {
            this.$scope.feed = {title: "foo"};
            this.FeedCache = this.$injector.get('FeedCache');
            this.$q = this.$injector.get('$q');
            spyOn(this.FeedCache, 'subscribe').and.callThrough();
            this.FeedCtrl = this.$controller('FeedCtrl', {$scope: this.$scope, $route: {current: {params: {id: 0}}}});
        });
        it('#refresh', function () {
            var url = "http://foo.fr";
            this.$scope.refresh(url);
            expect(this.FeedCache.subscribe).toHaveBeenCalledWith(url);
        });
    });
    describe('FeedListCtrl', function () {
        beforeEach(function () {
            var self = this;
            inject(function ($controller, $injector) {
                self.feed = {id: 'foo', title: 'bar'};
                self.scope = $injector.get('$rootScope').$new();
                self.FeedListCtrl = $controller('FeedListCtrl', {$scope: self.scope});
            });
        });
        it('#unsubscribe', function () {
            this.$window.confirm.and.returnValue(true);
            this.scope.unsubscribe(this.feed);
            expect(this.$window.confirm).toHaveBeenCalled();

        });
    });
    describe('SubscribeCtrl', function () {
        beforeEach(function () {
            var self = this;
            inject(function ($controller, $window, Feed) {
                self.scope = {};
                self.Feed = Feed;
                self.SubscribeCtrl = $controller('SubscribeCtrl', {$scope: self.scope});
            });
        });
        it('#subscribe', function () {
            spyOn(this.Feed, 'subscribe');
            this.$window.prompt.and.returnValue('http://testFeed');
            this.scope.subscribe();
            expect(this.$window.prompt).toHaveBeenCalled();
            expect(this.Feed.subscribe).toHaveBeenCalled();
        });
    });
    describe('DashboardCtrl', function () {
        beforeEach(function () {
            var self = this;
            this.feed = {id: 'foo', title: 'title'};
            inject(function ($controller, $window) {
                self.scope = {};
                self.$window = $window;
                self.DashboardCtrl = $controller('DashboardCtrl', {'$scope': self.scope});
            });
        });
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
                //this.$scope.$apply();
                //this.$timeout.flush();
                expect(this.Feed.findAll).toHaveBeenCalled();
                //expect(this.Feed.subscribe).toHaveBeenCalled();
            });
        });
    });
    describe('EntryCtrl', function () {
        beforeEach(function () {
            var self = this;
            this.entry = {};
            inject(function ($controller, Entry, FeedCache, Notification) {
                self.scope = {};
                self.entry = {title: 'foo', favorite: false};
                self.Entry = Entry;
                self.route = {current: {params: {id: 'foo'}}};
                spyOn(self.Entry, 'toggleFavorite');
                spyOn(self.Entry, 'getById').and.callFake(function (id, cb) {
                    return cb(undefined, self.entry);
                });
                self.EntryCtrl = $controller('EntryCtrl', {$scope: self.scope, $route: self.route});
            });
        });
        it('#toggleFavorite', function () {
            expect(this.Entry.getById).toHaveBeenCalled();
            this.scope.toggleFavorite();
            expect(this.Entry.toggleFavorite).toHaveBeenCalled();
        });
    });
    describe('EntryListCtrl', function () {
        beforeEach(function () {
            this.EntryListCtrl = this.$controller('EntryListCtrl', {$scope: this.$scope});
        });
        it('when', function () {
            this.$scope.toggleFavorite();
            this.$scope.predicate({publishedDate: new Date()});
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

