/*global describe,jasmine,beforeEach,it,expect,angular,module,inject*/
xdescribe('flowReader', function () {
    "use strict";
    beforeEach(function () {
        var self=this;
        angular.module('test', ['$window.mock','flowReader','dropboxDatabase', 'dropbox.mock', 'googleFeed.mock'], 
            function (feedFinderProvider) {
            feedFinderProvider.setGoogle({
                load: function () {return;}
            });
        });
        module('test');
        inject(function($window){
            self.$window=$window;
        });
    });
    it('should run properly', function () {
        inject(function (baseUrl) {
            expect(baseUrl).toBeDefined();
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
            inject(function ($controller,$window) {
                self.scope = {};
                self.SubscribeCtrl = $controller('SubscribeCtrl', {$scope: self.scope});
            });
        });
        it('#subscribe', function () {
            this.$window.prompt.and.returnValue('http://testFeed');
            this.scope.subscribe();
            expect(this.$window.prompt).toHaveBeenCalled();
        });
    });
    describe('DashboardCtrl', function () {
        beforeEach(function () {
            var self = this;
            this.feed = {id: 'foo', title: 'title'};
            inject(function ($controller,$window) {
                self.scope = {};
                self.$window=$window;
                self.DashboardCtrl = $controller('DashboardCtrl', {'$scope': self.scope});
            });
        });
        it('$scope',function(){
            expect(this.scope.pageTitle).toBeDefined();
        });

    });
});