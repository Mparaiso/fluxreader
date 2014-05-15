/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global spyOn,describe,jasmine,beforeEach,it,expect,angular,module,inject*/
describe('flowReader', function () {
    "use strict";
    beforeEach(function () {
        var self = this;
        angular.module('test', ['$window.mock', 'flowReader', 'dropboxDatabase','myPagination', 'dropbox.mock', 'googleFeed.mock'],
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
            expect(this.MainCtrl).toBeDefined();
        });
    });
    describe('IndexCtrl',function(){
        beforeEach(function(){
            this.$scope=this.$rootScope.$new();
            this.IndexCtrl=this.$controller('IndexCtrl',{$scope:this.$scope});
        });
        it('when',function(){
            ;
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
            this.$route={current:{params:{id:0}}};
            this.SearchCtrl=this.$controller('SearchCtrl',{$scope:this.$scope,$route:this.$route}) ;
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
    describe('FeedListCtrl', function () {
        beforeEach(function () {
            var self = this;
            inject(function ($controller) {
                self.feed = {id: 'foo', title: 'bar'};
                self.scope = {};
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
            expect(this.scope.entry.title).toEqual('foo');
        });
        it('#entry',function(){
            expect(this.Entry.getById).toHaveBeenCalled();
        });
    });

});
