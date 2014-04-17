/*global angular,google*/
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 * dependencies dropbox.js googleFeed.js angular.js angular-route.js
 */
(function (window, undefined) {
    "use strict";
    angular.module('flowReader', ['ngRoute', 'ngSanitize', 'dropbox', 'dropboxDatabase', 'googleFeed'],
        function (feedFinderProvider, $routeProvider, $locationProvider, dropboxClientProvider, baseUrl) {
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
                .when('/dashboard/entry/:id', {
                    controller: 'EntryCtrl',
                    templateUrl: baseUrl.concat('templates/entry.html'),
                    authenticated: true,
                    resolve: {
                        entry: function ($route, $q, Entry) {
                            var deferred = $q.defer();
                            Entry.getById($route.current.params.id, function (err, entry) {
                                if (entry) {
                                    deferred.resolve(entry);
                                } else {
                                    deferred.reject(entry);
                                }
                            });
                            return deferred.promise;
                        }
                    }
                })
                .when('/dashboard/feed/:id', {
                    controller: 'FeedCtrl',
                    authenticated: true,
                    templateUrl: baseUrl.concat('templates/dashboard.html'),
                    resolve: {
                        feed: function ($route, $q, Feed) {
                            var deferred = $q.defer();
                            Feed.getById($route.current.params.id, function (err, feed) {
                                if (feed) {
                                    deferred.resolve(feed);
                                } else {
                                    deferred.reject(err);
                                }
                            });
                            return deferred.promise;
                        }
                    }
                })
                .when('/dashboard/account', {
                    controller: 'AccountCtrl',
                    templateUrl: baseUrl.concat('templates/account.html')
                })
                .when('/dashboard/search/:q', {
                    templateUrl: baseUrl.concat('templates/dashboard.html'),
                    controller: 'SearchCtrl'
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
        .service('FeedRepository', function (Feed) {
            /* simple way to keep feeds in memory */
            var self = this;
            this.feeds = [];
            this.load = function (callback) {
                callback = callback || angular.noop;
                Feed.findAll(function (err, feeds) {
                    self.feeds = feeds;
                    callback(null, feeds);
                });
            };
        })
        .service('EntryRepository', function (Entry, Feed) {
            /* simple way to keep entries in memory */
            var self = this;
            this.entries = [];
            this.load = function (query, callback) {
                if (query instanceof Function) {
                    callback = query;
                    query = {};
                }
                callback = callback || angular.noop;
                Entry.findAll(query, function (err, entries) {
                    entries.forEach(function (entry) {
                        Feed.getById(entry.feedId, function (err, feed) {
                            entry.feed = feed;
                        });
                    });
                    self.entries = entries;
                    callback(null, entries);
                });
            };
        })
        .value('globals', {
            siteTitle: 'Flow Reader',
            title: 'Flow Reader'
        })
        .controller('SubscribeCtrl', function ($scope, Feed, feedFinder, FeedRepository, EntryRepository, $window) {
            $scope.subscribe = function () {
                var url = $window.prompt('Enter the feed URL');
                if (url) {
                    feedFinder.open(function () {
                        feedFinder.findFeedByUrl(url, function (err, feed) {
                            Feed.insert(feed, function (err, result) {
                                FeedRepository.load();
                                EntryRepository.load();
                            });
                        });
                    });
                }
            };
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
        .controller('SearchCtrl', function ($scope, $route, EntryRepository) {
            $scope.query = $route.current.params.q;
            $scope.pageTitle = ['Results for "', $scope.query, '" '].join("");
            $scope.EntryRepository = EntryRepository;
            EntryRepository.load(function () {
                $scope.$apply('EntryRepository');
            });
        })
        .controller('DashboardCtrl', function ($scope, EntryRepository) {
            $scope.pageTitle = "Latest Entries";
            $scope.EntryRepository = EntryRepository;
            EntryRepository.load(function () {
                $scope.$apply('EntryRepository');
            });
        })
        .controller('FeedCtrl', function ($scope, feed, EntryRepository) {
            $scope.pageTitle = ['Latest Entries for "', feed.title, '"'].join('');
            $scope.feed = feed;
            $scope.EntryRepository = EntryRepository;
            EntryRepository.load({feedId: feed.id}, function (err, entries) {
                EntryRepository.entries = entries;
                $scope.$apply('EntryRepository');
            });
        })
        .controller('AccountCtrl', function ($scope, dropboxClient) {
            dropboxClient.getAccountInfo(function (err, accountInfo) {
                $scope.accountInfo = accountInfo;
            });
        })
        .controller('EntryCtrl', function ($scope, entry, Feed) {
            $scope.entry = entry;
            Feed.getById(entry.feedId, function (err, feed) {
                $scope.entry.feed = feed;
                $scope.$apply('entry');
            });
        })
        .controller('EntryListCtrl', function ($timeout, $scope, Entry, Feed, EntryRepository, FeedRepository) {
            $scope.toggleFavorite = function (entry) {
                entry = entry || {};
                console.log(entry);
                if (entry.id) {
                    Entry.toggleFavorite(entry, function (err, _entry) {
                        console.log('favorite toggled');
                        Object.keys(_entry).forEach(function (key) {
                            entry[key] = _entry[key];
                        });
                    });
                }
            };
        })
        .controller('FeedListCtrl', function ($window, $scope, Feed, FeedRepository, EntryRepository) {
            $scope.FeedRepository = FeedRepository;
            $scope.unsubscribe = function (feed) {
                var confirm = $window.confirm('Unsubscribe '.concat(feed.title).concat(' ?'));
                if (confirm) {
                    Feed.delete(feed, function () {
                        FeedRepository.load();
                        EntryRepository.load();
                    });
                }
            };
            FeedRepository.load(function () {
                $scope.$apply('FeedRepository');
            });
        })
        .controller('SearchFormCtrl', function ($scope, $route, $location) {
            $scope.search = function () {
                if (this.q && this.q.length >= 3) {
                    $location.path('/dashboard/search/'.concat(this.q));
                }
            };
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