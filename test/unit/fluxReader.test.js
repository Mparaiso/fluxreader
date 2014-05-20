/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global spyOn,describe,jasmine,beforeEach,it,expect,angular,module,inject*/
describe('ng',function(){
    "use strict";
    beforeEach(function(){
        angular.module('test',['ngSanitize']);
        module('test');
        var self=this;
        inject(function($injector,$rootScope,$timeout,$compile){
            self.$injector = $injector;
            self.$compile=$compile;
            self.$rootScope=$rootScope;
            self.$timeout=$timeout;
        });
    });
    //@note @angular test directives
    describe('thumbnail',function(){
        beforeEach(function(){
            this.elm = angular.element("<div thumbnail='content' ng-bind-html='content'></div>");
            this.$compile(this.elm)(this.$rootScope);
            this.$rootScope.content="";
            this.$rootScope.$apply();
            this.$rootScope.content =" <img src='foobar.png'/> <a href='http//foo.com'>foo</a> ";
            this.$rootScope.$apply();
            this.$timeout.flush();
        });
        it('a must have a target attribute equal to _blank',function(){
            var a,img;
            a =this.elm.find('a').first();
            img = this.elm.find('img');
            expect(a.attr('target')).toEqual('_blank'); 
            expect(img.parent().hasClass('thumbnail')).toBe(true);
        });
    });
});

describe('fluxreader', function () {
    "use strict";
    beforeEach(function () {
        var self = this;
        angular.module('test', ['$window.mock', 'fluxReader', 'dropboxDatabase','pagination', 'dropbox.mock', 'googleFeed.mock'],
                       function (feedFinderProvider) {
                           feedFinderProvider.setGoogle({
                               load: function () {
                                   return;
                               }
                           });
                       }).constant('forceHTTPS',false);
                       module('test');
                       inject(function ($window,$rootScope,$injector,$controller) {
                           self.$injector=$injector;
                           self.$window = $window;
                           self.$controller=$controller;
                           self.$rootScope=$rootScope;
                           self.$scope=$rootScope.$new();
                       });
    });
    it('should run properly', function () {
        inject(function (baseUrl) {
            expect(baseUrl).toBeDefined();
        });
    });
    describe('MainCtrl',function(){
        beforeEach(function(){
            this.$scope=this.$rootScope.$new();
            this.MainCtrl=this.$controller('MainCtrl',{$scope:this.$scope});
        });
        it('ok',function(){
            this.$scope.isAuthenticated();
            this.$scope.signOut();
            this.$scope.signIn();
        });
    });
    describe('IndexCtrl',function(){
        beforeEach(function(){
            this.$scope=this.$rootScope.$new();
            this.IndexCtrl=this.$controller('IndexCtrl',{$scope:this.$scope});
        });
        it('when',function(){
        });
    });
    describe('SignInCtrl',function(){
        beforeEach(function(){

            this.SignInCtrl=this.$controller('SignInCtrl',{$scope:this.$scope});
        });
        it('when',function(){
            expect(this.SignInCtrl).toBeDefined();
        });
    });
    describe('SearchCtrl',function(){
        beforeEach(function(){
            this.query="foo";
            this.SearchCtrl=this.$controller('SearchCtrl',{$scope:this.$scope,query:this.query}) ;
        });
        it('when',function(){
            expect(this.SearchCtrl).toBeDefined();
        });
    });
    describe('SearchFormCtrl',function(){
        beforeEach(function(){
            this.SearchFormCtrl=this.$controller('SearchFormCtrl',{$scope:this.$scope});
        });
        it('when',function(){
            this.$scope.q="feed";
            this.$scope.search();
        });
    });
    describe('FeedCtrl',function(){
        beforeEach(function(){
            this.FeedCtrl=this.$controller('FeedCtrl',{$scope:this.$scope,$route:{current:{params:{id:0}}}});
        });
        it('#refresh',function(){
            this.$scope.refresh("http://foo.fr");
        });
    });
    describe('FeedListCtrl', function () {
        beforeEach(function () {
            var self = this;
            inject(function ($controller,$injector) {
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
    describe('AccountCtrl',function(){
        beforeEach(function(){
            this.AccountCtrl=this.$controller('AccountCtrl',{$scope:this.$scope});
        });
        it('when',function(){
            this.$scope.refresh(); 
        });
    });
    describe('EntryCtrl',function(){
        beforeEach(function(){
            var self=this;
            this.entry={};
            inject(function($controller,Entry,FeedCache,Notification){
                self.scope={};
                self.entry={title:'foo'};
                self.Entry=Entry;
                self.route = {current:{params:{id:'foo'}}};
                spyOn(self.Entry,'getById').and.callFake(function(id,cb){
                    return cb(undefined,self.entry);
                });
                self.EntryCtrl=$controller('EntryCtrl',{$scope:self.scope,$route:self.route});
            });
        });
        it('#entry',function(){
            this.scope.toggleFavorite();
            expect(this.scope.entry.title).toEqual('foo');
        });
        it('#entry',function(){
            expect(this.Entry.getById).toHaveBeenCalled();
        });
    });
    describe('EntryListCtrl',function(){
        beforeEach(function(){
            this.EntryListCtrl=this.$controller('EntryListCtrl',{$scope:this.$scope});
        });
        it('when',function(){
            this.$scope.toggleFavorite();
            this.$scope.predicate({publishedDate:new Date()});
        });
    });
    describe('UnreadCtrl',function(){
        beforeEach(function(){
            this.UnreadCtrl=this.$controller('UnreadCtrl',{$scope:this.$scope});
        });
        it('pageTitle',function(){
            expect(this.$scope.pageTitle).toBe("Unread entries");
        });
    });
    describe('Link',function  () {
        it('exists',function  () {
            this.Link=this.$injector.get('Link');
            expect(this.Link).toBeDefined();
        })
    })
});

