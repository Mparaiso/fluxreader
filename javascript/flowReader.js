/*global angular,google*/
/**
 * @copyright mparaiso <mparaiso@online.fr>
 * @license LGPL
 * dependencies dropbox.js googleFeed.js angular.js angular-route.js
 */
(function (window, undefined) {
    "use strict";
    angular.module('flowReader', ['ngRoute', 'dropbox', 'dropboxDatabase', 'googleFeed'],
        function config(feedFinderProvider, $routeProvider, $locationProvider, dropboxClientProvider, baseUrl) {
            /**
             * @note @angular injecting constant in config
             * @link http://stackoverflow.com/questions/16339595/angular-js-configuration-for-different-enviroments
             * @link http://stackoverflow.com/questions/12664787/what-providers-services-are-available-in-module-config
             */
            $routeProvider
                .when('/', {
                    controller: 'IndexCtrl',
                    templateUrl: baseUrl.concat('templates/index.html')
                })
                .when('/dashboard', {
                    controller: 'DashboardCtrl',
                    templateUrl: baseUrl.concat('templates/dashboard.html'),
                    authenticated: true
                })
                .when('/dashboard/account', {
                    controller: 'AccountCtrl',
                    templateUrl: baseUrl.concat('templates/account.html')
                })
                .otherwise({
                    redirectTo: '/'
                });
            //$locationProvider.html5Mode(true);
            //dropboxClientProvider.setKey('aa8d82y2a6iqbs9');
            feedFinderProvider.setGoogle(google);
        })
        .constant('DROPBOX_APIKEY', 'gi42kr1ox74tyrb')
        .constant('baseUrl', window.location.pathname)
        .value('globals', {
            title: 'Flow Reader'
        })
        .controller('MainCtrl', function ($scope, globals, $location, dropboxClient, baseUrl) {
            $scope.accountInfo = {};
            $scope.globals = globals;
            $scope.baseUrl = baseUrl;
            $scope.isAuthenticated = function () {
                return dropboxClient.isAuthenticated();
            };
            //@note promise unwrapping deprecated @link https://github.com/angular/angular.js/commit/5dc35b527b3c99f6544b8cb52e93c6510d3ac577
            dropboxClient.getAccountInfo(function (err, accountInfo) {
                $scope.accountInfo = accountInfo;
                $scope.$apply('accountInfo');
            });
            $scope.signOut = function () {
                if (dropboxClient.isAuthenticated()) {
                    dropboxClient.signOut(function () {
                        $location.path('/');
                    });
                }
            };
            $scope.signIn = function () {
                dropboxClient.signIn();
            };
        })
        .controller('IndexCtrl', function ($scope, $log) {
            $log.debug('IndexCtrl');
        })
        .controller('DashboardCtrl', function ($scope, $window, feedFinder, Feed, Entry) {
            var loadFeeds, init, getFeedById, loadEntries;
            /**
             * init controller
             */
            init = function () {
                loadFeeds(loadEntries.bind(null, angular.noop));
            };
            /**
             *
             * @param id
             * @returns {*}
             */
            getFeedById = function (id) {
                if ($scope.feeds instanceof Array) {
                    return $scope.feeds.filter(function (feed) {
                        return feed.id.toString() === id.toString();
                    })[0];
                }
                return undefined;

            };
            loadFeeds = function (callback) {
                Feed.findAll(function (err, feeds) {
                    $scope.feeds = feeds;
                    $scope.$apply('feeds');
                    callback(err, feeds);
                });
            };
            loadEntries = function (callback) {
                Entry.findAll(function (err, entries) {
                    entries.forEach(function (entry) {
                        entry.feed = getFeedById(entry.feedId);
                    });
                    $scope.entries = entries;
                    $scope.$apply('entries');
                    callback(err, entries);
                });
            };

            $scope.categories = [];
            $scope.unsubscribe = function (feed) {
                var confirm = $window.confirm('Unsubscribe '.concat(feed.title).concat(' ?'));
                if (confirm) {
                    Feed.delete(feed, function () {
                        init();
                    });
                }
            };
            $scope.subscribe = function () {
                var url = $window.prompt('Enter the feed URL');
                if (url) {
                    feedFinder.open(function () {
                        feedFinder.findFeedByUrl(url, function (err, feed) {
                            Feed.insert(feed, function (err, result) {
                                init();
                            });
                        });
                    });
                }
            };
            init();

        })
        .controller('AccountCtrl', function ($scope, dropboxClient) {
            dropboxClient.getAccountInfo(function (err, accountInfo) {
                $scope.accountInfo = accountInfo;
            });
        })
        .run(function (dropboxClient, $location, $route, $rootScope, $log) {
            dropboxClient.authenticate(function (error, result) {
                if (error) {
                    $log.debug('authentication error', error);
                } else {
                    $log.debug('authenticated', arguments);
                }
            });
            /**
             * @note @angular authorization
             * on route change check if user is signed in with dropbox
             * @link http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/
             */
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
                $log.debug('$routeChangeStart', event, next, current);
                if ($location.path() === '/') {
                    return;
                }
                if (next.authenticated) {
                    if (!dropboxClient.isAuthenticated()) {
                        $location.path('/');
                    }
                }
            });
        });
}(window));