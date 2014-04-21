/*jslint browser:true,plusplus:true*/
/*global angular,async,google*/
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 * dependencies dropbox.js googleFeed.js angular.js angular-route.js
 */
(function (window, undefined) {
    "use strict";
    var _enum = 0;
    angular.module('flowReader',
        ['ngRoute', 'ngSanitize', 'dropbox', 'dropboxDatabase', 'googleFeed'],
        function (feedFinderProvider, $routeProvider, dropboxClientProvider, baseUrl) {
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
                .when('/signin', {
                    controller: 'SignInCtrl',
                    templateUrl: baseUrl.concat('templates/index.html'),
                    authenticated: false
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
                .when('/dashboard/favorite', {
                    controller: 'FavoriteCtrl',
                    authenticated: true,
                    templateUrl: baseUrl.concat('templates/dashboard.html')
                })
                .when('/dashboard/unread', {
                    controller: 'UnreadCtrl',
                    authenticated: true,
                    templateUrl: baseUrl.concat('templates/dashboard.html')
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
        .constant('baseUrl', window.location.pathname.match(/(.*\/)/)[1])
        .constant('Events', {
            FAVORITE_TOGGLED: _enum++,
            REFRESH_DONE: _enum++,
            NOTIFIY_ERROR: _enum++
        })
        .value('globals', {
            siteTitle: 'Flow Reader',
            title: 'Flow Reader',
            email: 'mparaiso@online.fr',
            url: window.location.origin,
            year: (new Date()).getFullYear()
        })
        .controller('SubscribeCtrl', function ($scope, Events, Feed, feedFinder, FeedCache, $location, $window) {
            $scope.subscribe = function () {
                var url = $window.prompt('Enter the feed URL');
                if (url) {
                    Feed.subscribe(url, function (err, feed) {
                        if (err) {
                            $scope.$emit(Events.NOTIFIY_ERROR, err);
                            /* @todo deal with errors */
                        } else {
                            FeedCache.feeds.push(feed);
                            $location.path("/dashboard/feed/".concat(feed.id));
                        }
                    });
                }
            };
        })
        .controller('MainCtrl', function ($scope, Events, $log, globals, $location, dropboxClient, baseUrl) {
            $scope.utils = {
                round: Math.round.bind(Math),
                pow: Math.pow.bind(Math)
            };
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
            $scope.$on(Events.NOTIFIY_ERROR, function (event, err) {
                $log.warn(err);
            });
        })
        .controller('IndexCtrl', function ($scope, $log) {
            $log.debug('IndexCtrl');
        })
        .controller('SignInCtrl', function ($scope, $log, dropboxClient) {
            $log.debug('SignIn');
            dropboxClient.signIn();
        })
        .controller('SearchCtrl', function ($scope, $route, EntryCache) {
            $scope.query = $route.current.params.q;
            $scope.pageTitle = ['Results for "', $scope.query, '" '].join("");
            $scope.EntryCache = EntryCache;
            EntryCache.load();
        })
        .controller('DashboardCtrl', function ($scope, EntryCache) {
            $scope.pageTitle = "Latest Entries";
            $scope.EntryCache = EntryCache;
            EntryCache.load();
        })
        .controller('FeedCtrl', function ($scope, feed, EntryCache, baseUrl) {
            $scope.extra = baseUrl + 'templates/feed-extra.html';
            $scope.pageTitle = ['Latest Entries for "', feed.title, '"'].join('');
            $scope.feed = feed;
            $scope.EntryCache = EntryCache;
            EntryCache.load({feedId: feed.id});
        })
        .controller('FavoriteCtrl', function ($scope, EntryCache, Events) {
            $scope.pageTitle = "Favorite entries";
            $scope.EntryCache = EntryCache;
            $scope.$on(Events.FAVORITE_TOGGLED, function (event, entry) {
                if (!entry.favorite) {
                    EntryCache.remove(entry);
                }
            });
            EntryCache.load({favorite: true});
        })
        .controller('UnreadCtrl', function ($scope, EntryCache) {
            $scope.pageTitle = "Unread entries";
            $scope.EntryCache = EntryCache;
            EntryCache.load({read: false});
        })
        .controller('AccountCtrl', function ($timeout, $log, Events, $scope, dropboxClient, Feed, FeedCache) {
            $scope.refresh = function () {
                return Feed.findAll(function (err, feeds) {
                    return async.eachSeries(feeds, function (feed, next) {
                        $log.log('updating '.concat(feed.feedUrl));
                        return $timeout(Feed.subscribe.bind(Feed, feed.feedUrl, next), 1000);
                    }, function (err, res) {
                        $log.log('refresh done', arguments);
                        if (!err) {
                            $scope.$emit(Events.REFRESH_DONE, arguments, feeds);
                        }
                    });
                });
            };
            dropboxClient.getAccountInfo(function (err, accountInfo) {
                $scope.accountInfo = accountInfo;
            });
        })
        .controller('EntryCtrl', function ($scope, entry, FeedCache, Entry) {
            if (!entry.read) {
                entry.read = true;
                Entry.markAsRead(entry, angular.noop);
            }
            $scope.entry = entry;
            $scope.toggleFavorite = function () {
                Entry.toggleFavorite(this.entry, function (err, _entry) {
                    this.entry.favorite = !_entry.favorite;
                });
            };
            FeedCache.getById(entry.feedId).then(function (feed) {
                $scope.entry.feed = feed;
            });
        })
        .controller('EntryListCtrl', function (Events, $scope, Entry, Feed, EntryCache, FeedCache) {
            $scope.predicate = function (item) {
                if (item.publishedDate) {
                    return new Date(item.publishedDate);
                }
            };
            $scope.toggleFavorite = function (entry) {
                entry = entry || {};
                if (entry.id) {
                    Entry.toggleFavorite(entry, function (err, _entry) {
                        Object.keys(_entry).forEach(function (key) {
                            entry[key] = _entry[key];
                        });
                        $scope.$emit(Events.FAVORITE_TOGGLED, entry);
                    });

                }
            };
        })
        .controller('FeedListCtrl', function ($window, $scope, Feed, FeedCache, EntryCache) {
            $scope.links = [
                {name: 'ALL', href: '#/dashboard'},
                {name: 'UNREAD', href: '#/dashboard/unread'},
                {name: 'FAVORITES', href: '#/dashboard/favorite'}
            ];
            $scope.FeedCache = FeedCache;
            $scope.unsubscribe = function (feed) {
                var confirm = $window.confirm('Unsubscribe '.concat(feed.title).concat(' ?'));
                if (confirm) {
                    Feed.delete(feed, function () {
                        FeedCache.load(true).then(function () {
                            $scope.$apply('FeedCache');
                            EntryCache.load();
                        });
                    });
                }
            };
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
                if (next.authenticated) {
                    if (!dropboxClient.isAuthenticated()) {
                        $location.path('/signin');
                    }
                } else if (next.authenticated === false && dropboxClient.isAuthenticated()) {
                    /**
                     * if user requires signin page but already authenticated,
                     * redirect to dashboard
                     */
                    $location.path('/dashboard');
                }

            });
        });
}(window));