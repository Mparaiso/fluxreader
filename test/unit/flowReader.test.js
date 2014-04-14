xdescribe('flowReader', function () {
    beforeEach(function () {
        angular.module('test', ['flowReader', 'dropbox.mock', '$window.mock', 'googleFeed.mock'], function (feedProvider) {
            feedProvider.setGoogle({
                load: function () {
                }
            });
        });
        module('test');
    });
    it('should run properly', function () {
        inject(function (baseUrl) {
            expect(baseUrl).not.toBe('/');
        });
    });
    describe('DashboardCtrl', function () {
        var scope = {};
        describe('#subscribe', function () {
            it('should have a subscribe function', function (done) {
                inject(function ($controller, $log, $window, feed) {
                    var c = $controller('DashboardCtrl', {$scope: scope, $log: $log, $window: $window, feed: feed});
                    scope.subscribe('http://testFeed').then(done);
                });
            });
        })
    });
});