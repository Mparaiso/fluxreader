describe('flowReader', function () {
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
    describe('DashboardCtrl', function () {
        beforeEach(function () {
            var self = this;
            this.feed = {id: 'foo', title: 'title'};
            inject(function ($controller, $log, $window, feed) {
                $window.prompt.and.returnValue('http://testFeed');
                $window.confirm.and.returnValue(true);
                self.scope = {};
                self.DashboardCtrl = $controller('DashboardCtrl', {$scope: self.scope});
                self.$window = $window;
            });
        });
        it('#subscribe', function () {
            this.$window.prompt.and.returnValue('http://testFeed');
            this.scope.subscribe();
            expect(this.$window.prompt).toHaveBeenCalled();
        });
        it('#unsubscribe', function () {
            this.$window.confirm.and.returnValue(true);
            this.scope.unsubscribe(this.feed);
            expect(this.$window.confirm).toHaveBeenCalled();

        });
    });
});