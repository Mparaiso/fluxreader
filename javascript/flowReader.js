/*jslint browser:true,plusplus:true*/
/*global angular,async,google*/
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 * dependencies dropbox.js googleFeed.js angular.js angular-route.js
 */
(function (window, angular, undefined) {
    "use strict";
    var _enum = 0;
    angular.module('flowReader',
        ['ngRoute', 'ngSanitize', 'dropbox', 'dropboxDatabase', 'googleFeed','lzCompressor','myNotification'],
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
                    // resolve: {
                    //     entry: function ($route, $q, Entry) {
                    //         var deferred = $q.defer();
                    //         Entry.getById($route.current.params.id, function (err, entry) {
                    //             if (entry) {
                    //                 deferred.resolve(entry);
                    //             } else {
                    //                 deferred.reject(entry);
                    //             }
                    //         });
                    //         return deferred.promise;
                    //     }
                    // }
                })
                .when('/dashboard/feed/:id', {
                    controller: 'FeedCtrl',
                    authenticated: true,
                    templateUrl: baseUrl.concat('templates/dashboard.html')
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
        .constant('forceHTTPS', true)
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
        .controller('MainCtrl', function ($scope,Notification, Events, $log, globals, $location, dropboxClient, baseUrl) {
            $scope.utils = {
                round: Math.round.bind(Math),
                pow: Math.pow.bind(Math),
                getFavicon:function(linkUrl){
                    return ["//getfavicon.appspot.com/",linkUrl,"?defaulticon=lightpng"].join('');
                }
            };
            $scope.globals = globals;
            $scope.baseUrl = baseUrl;
            $scope.Notification = Notification;
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
        .controller('IndexCtrl', angular.noop)
        .controller('SubscribeCtrl', function ($scope, Notification, Events, Feed, feedFinder, FeedCache, $location, $window) {
            $scope.subscribe = function () {
                var url = $window.prompt('Enter the feed URL');
                if (url) {
                    Feed.subscribe(url, function (err, feed) {
                        if (err) {
                            Notification.notify({
                                text:err.message,
                                type:Notification.type.ERROR
                            });
                            $scope.$apply('Notification');
                        } else {
                            FeedCache.feeds.push(feed);
                            Notification.notify({
                                text:"You've successfully subscribed to "+feed.title,
                                type:Notification.type.SUCCESS
                            });
                            $location.path("/dashboard/feed/".concat(feed.id));
                        }
                    });
                }
            };
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
        .controller('DashboardCtrl', function ($scope, EntryCache,FeedCache) {
            $scope.pageTitle = "Latest Entries";
            $scope.EntryCache = EntryCache;
            EntryCache.load().then(function(){
                FeedCache.feeds.forEach(function(feed){
                    feed.entryCount = EntryCache.entries.filter(function(entry){
                        return entry.feedId===feed.id && !entry.read;
                    }).length;
                });
            });
        })
        .controller('FeedCtrl', function ($scope, $route,Notification, FeedCache,$location, EntryCache, baseUrl) {
            var feedId = $route.current.params.id;
            $scope.extra = baseUrl + 'templates/feed-extra.html';
            $scope.EntryCache = EntryCache;
            $scope.refresh = function(url){
                FeedCache.subscribe(url).then(function(res){
                   return init();
                }).then(function(){
                    Notification.notify({text:$scope.feed.title+" has been refreshed.",type:Notification.type.SUCCESS});
                });
            };
            (function init(){
                return EntryCache.load({feedId: feedId })
                    .then(FeedCache.getById.bind(FeedCache, feedId))
                    .then(function (feed) {
                        if(!feed){
                            return $location.path('/dashboard');
                        }
                        $scope.feed = feed;
                        $scope.pageTitle = ['Latest Entries for "', $scope.feed.title, '"'].join('');
                    });
            }());
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
        .controller('EntryCtrl', function ($scope, Notification,FeedCache,$route, Entry,compressor) {
            Entry.getById($route.current.params.id, function (err, entry) {
                if (!entry) {
                    Notification.notify({text:'Entry not found',type:Notification.type.ERROR});
                }else{
                    if (!entry.read) {
                        entry.read = true;
                        Entry.markAsRead(entry, angular.noop);
                    }
                    if(entry.compressed){
                        entry.content=compressor.decompress(entry.content);
                    }
                    $scope.entry = entry;
                    FeedCache.getById(entry.feedId).then(function (feed) {
                        $scope.entry.feed = feed;
                    });
                }
            });

            $scope.toggleFavorite = function () {
                Entry.toggleFavorite(this.entry, function (err, _entry) {
                    $scope.entry.favorite = _entry.favorite;
                });
            };
        })
        .controller('EntryListCtrl', function (Events, Notification,$scope, Entry, Feed, EntryCache, FeedCache) {
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
            $scope.removeEntry = function () {
                if (this.entry) {
                    EntryCache.delete(this.entry).then((function (err, res) {
                        Notification.notify({
                            text:['Entry: "',this.entry.title.substr(0,100),'" removed.'].join(''),
                            type:Notification.type.INFO});
                    }).bind(this));
                }
            };
        })
        .controller('FeedListCtrl', function ($window, Notification,$scope, Feed, FeedCache, EntryCache) {
            /**
             * display the list of feeds
             */
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
                        Notification.notify({
                            text:['Feed ',feed.title,' removed.'].join(''),
                            type:Notification.INFO
                        });
                        FeedCache.load(true).then(function () {
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
        .run(function (dropboxClient, $location, $route, $rootScope, $log, forceHTTPS, $window) {
            if (forceHTTPS === true) {
                //if not https redirect
                if (($window.location.protocol !== 'https:') && (['127.0.0.1', 'localhost'].indexOf($window.location.hostname) < 0)) {
                    $window.location = $window.location.href.replace(/^http/, 'https');
                }
            }
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
}(window,angular));
