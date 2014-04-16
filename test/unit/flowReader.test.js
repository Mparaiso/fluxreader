/*global describe,beforeEach,it,expect,angular,module,inject*/
describe('flowReader', function () {
    "use strict";
    beforeEach(function () {
        angular.module('test', ['flowReader', 'dropbox.mock', '$window.mock', 'googleFeed.mock'], function (feedProvider, $provide) {
            feedProvider.setGoogle({
                load: function () {
                }
            });
        });
        module('test');
    });
    it('should run properly', function () {
        inject(function (baseUrl) {
            expect(baseUrl).toBeDefined();
        });
    });
    describe('FeedListCtrl', function () {
        beforeEach(function () {
            var self = this;
            inject(function ($controller, $window) {
                self.feed = {id: 'foo', title: 'bar'};
                self.scope = {};
                self.$window = $window;
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
            inject(function ($controller, $window) {
                self.scope = {};
                self.$window = $window;
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
            inject(function ($controller, $log, $window, feed) {
//                $window.confirm.and.returnValue(true);
                self.scope = {};
                self.DashboardCtrl = $controller('DashboardCtrl', {$scope: self.scope});
                self.$window = $window;
            });
        });
        it('$scope',function(){
            expect(this.scope.pageTitle).toBeDefined();
        });

    });
});