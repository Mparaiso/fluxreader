/*jslint eqeq:true,node:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,window,async,google,jquery*/
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 * dependencies dropbox.js googleFeed.js angular.js angular-route.js
 */
"use strict";
angular.module('fluxReader', ['ngRoute', 'ngSanitize','opml','dropbox', 'dropboxDatabase', 'googleFeed', 'notification', 'pagination'])
.config(function (feedFinderProvider, $routeProvider, dropboxClientProvider, baseUrl, DROPBOX_APIKEY) {
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
    .when('/dashboard/search/:q*', {
        templateUrl: baseUrl.concat('templates/dashboard.html'),
        controller: 'SearchCtrl',
        resolve: {
            query: function ($route) {
                return $route.current.params.q;
            }
        }

    })
    .otherwise({
        redirectTo: '/'
    });
    feedFinderProvider.setGoogle(google);
    feedFinderProvider.setNumEntries(50);
})
.constant('forceHTTPS', true)
.constant('baseUrl', window.location.pathname.match(/(.*\/)/)[1])
.constant('Events', {
    FAVORITE_TOGGLED: "Events.FAVORITE_TOGGLED",
    REFRESH_DONE: "Events.REFRESH_DONE",
    NOTIFIY_ERROR: "Events.NOTIFIY_ERROR",
    REFRESH_ALL_FEEDS_ERROR: "Events.REFRESH_ALL_FEEDS_ERROR",
    REFRESH_FEED_START: "Events.REFRESH_FEED_START",
    REFRESH_ALL_FEEDS_DONE: "Events.REFRESH_ALL_FEEDS_DONE",
    IMPORT_FEEDS_START:"Events.IMPORT_FEEDS_START",
    IMPORT_FEEDS_ERROR:"Events.IMPORT_FEEDS_ERROR",
    IMPORT_FEEDS_DONE:"Events.IMPORT_FEEDS_DONE",
    IMPORT_FEEDS_PROGRESS:"Events.IMPORT_FEEDS_PROGRESS"
})
.value('globals', {
    siteTitle: 'Flux Reader',
    title: 'Flux Reader',
    email: 'mparaiso@online.fr',
    url: window.location.origin,
    year: (new Date()).getFullYear(),
    EntryPerPage: 50
})
.controller('MainCtrl', function ($scope, $rootScope,$anchorScroll, Notification, Events, $log, globals, $location, dropboxClient, baseUrl,Import) {
    $scope.utils = {
        round: Math.round.bind(Math),
        pow: Math.pow.bind(Math),
        getFavicon: function (linkUrl) {
            return ["//getfavicon.appspot.com/", linkUrl, "?defaulticon=lightpng"].join('');
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
    $rootScope.$on(Events.REFRESH_FEED_START,function(event,feed){
        return Notification.notify({type:Notification.type.INFO,text:"Refreshing feed "+feed.title});
    });
    $rootScope.$on(Events.IMPORT_FEEDS_PROGRESS,function(event,feedUrl){
        return Notification.notify({type:Notification.type.INFO,text:"Importing feed "+feedUrl});
    });
    $rootScope.$on(Events.IMPORT_FEEDS_DONE,function(event){
        return Notification.notify({type:Notification.type.SUCCESS,text:"Done importing feeds ! "});
    });
    $rootScope.$on(Events.IMPORT_FEEDS_ERROR,function(event,err){
        return Notification.notify({type:Notification.type.ERROR,text:"Error importing feeds ! "+err});
    });
    $rootScope.$on(Import.events.IMPORT_FEED_START,function(event,url){
        return Notification.notify({type:Notification.type.INFO,text:"Importing feed  "+url});
    });
    $rootScope.$on(Import.events.IMPORT_FEED_SUCCESS,function(event,feed){
        return Notification.notify({type:Notification.type.SUCCESS,text:"Feed '"+feed.title+"' successfully imported"});
    });
    $rootScope.$on(Import.events.IMPORT_FEED_ERROR,function(event,error){
        return Notification.notify({type:Notification.type.ERROR,text:"Error importing feed :"+error});
    });
})
.controller('IndexCtrl', angular.noop)
.controller('SubscribeCtrl', function ($scope, Notification, Events, Feed, feedFinder, FeedProxy, $location, $window) {
    $scope.subscribe = function () {
        var url = $window.prompt('Enter the feed URL');
        if (url) {
            Notification.notify({
                text: ["Subscribing", url].join(" "),
                type: Notification.type.INFO
            });
            Feed.subscribe(url, function (err, feed) {
                if (err) {
                    Notification.notify({
                        text: err.message,
                        type: Notification.type.ERROR
                    });
                    $scope.$apply('Notification');
                } else {
                    FeedProxy.feeds.push(feed);
                    Notification.notify({
                        text: "You've successfully subscribed to " + feed.title,
                        type: Notification.type.SUCCESS
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
.controller('SearchCtrl', function ($scope, $route, $routeParams,query, EntryProxy) {
    $scope.query = query;
    $scope.q=query;
    $scope.pageTitle = ['Results for "', $scope.query, '" '].join("");
    $scope.EntryProxy = EntryProxy;
    EntryProxy.search($scope.query);
})
.controller('DashboardCtrl', function ($scope, Entry, EntryProxy, FeedProxy) {
    $scope.pageTitle = "Latest Entries";
    $scope.EntryProxy = EntryProxy;
    EntryProxy.load().then(function (entries) {
        FeedProxy.feeds.forEach(function (feed) {
            feed.entryCount = EntryProxy.entries.filter(function (entry) {
                return entry.feedId === feed.id && !entry.read;
            }).length;
        });
    });
})
.controller('FeedCtrl', function ($scope, $route, Notification, FeedProxy, $location, EntryProxy, baseUrl) {
    var init, feedId = $route.current.params.id;
    $scope.extra = baseUrl + 'templates/feed-extra.html';
    $scope.EntryProxy = EntryProxy;
    $scope.refresh = function (url) {
        Notification.notify({text: 'Refreshing ' + $scope.feed.title, type: Notification.type.INFO});
        return FeedProxy.subscribe(url).then(function (res) {
            Notification.notify({text: "Feed " + $scope.feed.title + " has been refreshed.", type: Notification.type.SUCCESS});
            return init();
        });
    };
    init = function () {
        return EntryProxy.load({feedId: feedId })
        .then(FeedProxy.getById.bind(FeedProxy, feedId))
        .then(function (feed) {
            if (!feed) {
                return $location.path('/dashboard');
            }
            $scope.feed = feed;
            $scope.pageTitle = ['Latest Entries for "', $scope.feed.title, '"'].join('');
        });
    };
    init();
})
.controller('FavoriteCtrl', function ($scope, EntryProxy, Events) {
    $scope.pageTitle = "Favorite entries";
    $scope.EntryProxy = EntryProxy;
    $scope.$on(Events.FAVORITE_TOGGLED, function (event, entry) {
        if (!entry.favorite) {
            EntryProxy.remove(entry);
        }
    });
    EntryProxy.load({favorite: true});
})
.controller('UnreadCtrl', function ($scope, EntryProxy) {
    $scope.pageTitle = "Unread entries";
    $scope.EntryProxy = EntryProxy;
    EntryProxy.load({read: false});
})
.controller('AccountCtrl', function (opml,$timeout, $window, $log, globals, Events, $scope, $rootScope, dropboxClient, Feed, FeedProxy,Import) {
    $scope.Import=Import;
    /** 
     * export feeds
     */
    $scope.export = function(){
        Feed.export(function(err,xmlString){
            var url;
            url = $window.URL.createObjectURL(new $window.Blob([xmlString]));
            $window.open(url,"fluxreader-subscriptions.xml");
            $scope.$apply();
        });
    };
    /**
    * import feeds
    * @param {window.FileList} fileList
    */
    $scope.import=function(event,fileList){
        var file=[].slice.call(fileList)[0];
        $rootScope.$broadcast(Events.IMPORT_FEEDS_START);
        return Feed.import(file).then(function(result){
            $rootScope.$broadcast(Events.IMPORT_FEEDS_DONE);
        },function(err){
            console.warn(err);
            $rootScope.$broadcast(Events.IMPORT_FEEDS_ERROR, err);
        },function(progress){
            $rootScope.$broadcast(progress.event,progress.value);
            switch(progress.event){
                case Import.events.IMPORT_FEED_SUCCESS:
                    FeedProxy.load(true);
                break;
            }
        });
    };
    $scope.refresh = function () {
        return Feed.findAll(function (err, feeds) {
            return async.eachSeries(feeds, function (feed, next) {
                $rootScope.$broadcast(Events.REFRESH_FEED_START, feed);
                $timeout(Feed.subscribe.bind(Feed, feed.feedUrl, next), 2000);
            }, function (err, res) {
                if (err) {
                    console.warn(err);
                    $rootScope.$broadcast(Events.REFRESH_ALL_FEEDS_ERROR, err);
                } else {
                    $rootScope.$broadcast(Events.REFRESH_ALL_FEEDS_DONE, arguments, feeds);
                }
            });
        });
    };
    dropboxClient.getAccountInfo(function (err, accountInfo) {
        $scope.accountInfo = accountInfo;
    });
})
.controller('EntryCtrl', function ($scope, Notification, $timeout, FeedProxy, $route, $location, Entry) {
    /* display one entry*/
    Entry.getById($route.current.params.id, function (err, entry) {
        return $timeout(function () {
            if (err || !entry) {
                Notification.notify({text: 'Entry not found', type: Notification.type.ERROR});
                $location.path('/dashboard');
            } else {
                if (!entry.read) {
                    entry.read = true;
                    Entry.markAsRead(entry, angular.noop);
                }
                $scope.entry = entry;
                FeedProxy.getById(entry.feedId).then(function (feed) {
                    $scope.entry.feed = feed;
                });

            }
        });
    });
    $scope.toggleFavorite = function () {
        Entry.toggleFavorite(this.entry, function (err, _entry) {
            $scope.entry.favorite = _entry.favorite;
        });
    };
    $scope.delete = function (entry) {
        Entry.delete(entry, function (err, res) {
            $timeout(function () {
                if (err) {
                    return Notification.notify({type: Notification.type.ERROR, text: "Error deleting entry " + entry.title.slice(0, 50)});
                }
                Notification.notify({type: Notification.type.ERROR, text: "Entry '" + entry.title.slice(0, 50) + "' deleted"});
                $location.path('/dashboard/feed/' + entry.feedId);
            });
        });
    };
})
.controller('EntryListCtrl', function (Events, globals, Notification, $scope, Entry, Feed, EntryProxy, Pagination, $anchorScroll, FeedProxy, $timeout) {
    Pagination.limit(globals.EntryPerPage);
    Pagination.reset();
    $scope.Pagination = Pagination;
    $scope.hasPrevious = function () {
        return Pagination.hasPrevious();
    };
    $scope.hasNext = function () {
        if ($scope.EntryProxy && $scope.EntryProxy.entries) {
            return Pagination.hasNext($scope.EntryProxy.entries);
        }
    };
    $scope.next = function () {
        if (!Pagination.hasNext(EntryProxy.entries)) {
            //console.log('dont have next',EntryProxy.entries.length,Pagination.limit(),Pagination.skip());
            return;
        }
        Pagination.next();
        $anchorScroll();
    };
    $scope.previous = function () {
        Pagination.previous();
        $anchorScroll();
    };
    $scope.predicate = function (item) {
        if (item.publishedDate) {
            return new Date(item.publishedDate);
        }
    };
    $scope.toggleFavorite = function (entry) {
        entry = entry || {};
        if (entry.id) {
            console.log(entry);
            Entry.toggleFavorite(entry, function (err, _entry) {
                Object.keys(_entry).forEach(function (key) {
                    entry[key] = _entry[key];
                });
                $scope.$emit(Events.FAVORITE_TOGGLED, entry);
            });

        }
    };
    $scope.removeEntry = function () {
        var self = this;
        if (this.entry) {
            EntryProxy.delete(this.entry).then(function (err, res) {
                Notification.notify({
                    text: ['Entry: "', self.entry.title.substr(0, 50).concat('...'), '" removed.'].join(''),
                    type: Notification.type.INFO});
            });
        }
    };
})
.controller('FeedListCtrl', function (Link, $window, Notification, $scope, Feed, FeedProxy, Entry, EntryProxy) {
    /**
    * display the list of feeds
    */
    $scope.links = Link.links;
    $scope.FeedProxy = FeedProxy;
    $scope.unsubscribe = function (feed) {
        var confirm = $window.confirm('Unsubscribe '.concat(feed.title).concat(' ?'));
        if (confirm) {
            Feed.delete(feed, function () {
                Notification.notify({
                    text: ['Feed ', feed.title, ' removed.'].join(''),
                    type: Notification.INFO
                });
                FeedProxy.load(true).then(function () {
                    EntryProxy.load();
                });
            });
        }
    };
    // read counts once
    var unwatchFeeds = $scope.$watch('FeedProxy.feeds', function (newValue, oldValue) {
        if (newValue !== oldValue && newValue.length > 1) {
            unwatchFeeds();
            Entry.findAll(function (err, entries) {
                Link.links[0].count = entries.length;
            });
            Entry.findUnread(function (err, entries) {
                Link.links[1].count = entries.length;
            });
            Entry.findFavorites(function (err, entries) {
                Link.links[2].count = entries.length;
            });
        }
    });
})
.controller('SearchFormCtrl', function ($scope, $route, $location) {
    $scope.search = function () {
        if (this.q && this.q.length >= 3) {
            $location.path('/dashboard/search/'.concat(this.q));
        }
    };
})
.service('Link', function () {
    /** links in the left menu */
    this.links = [
        {name: 'ALL', href: '#/dashboard'},
        {name: 'UNREAD', href: '#/dashboard/unread'},
        {name: 'FAVORITES', href: '#/dashboard/favorite'}
    ];
})
.run(function (dropboxClient, $location, $anchorScroll, $route, $rootScope, $log, forceHTTPS, $window) {
    if (forceHTTPS === true) {
        //if not https redirect
        if (($window.location.protocol !== 'https:') && (['127.0.0.1', 'localhost'].indexOf($window.location.hostname) < 0)) {
            $window.location = $window.location.href.replace(/^http/, 'https');
        }
    }
    dropboxClient.authenticate(function (error, result) {
        if (error) {
            $log.warn('authentication error', error);
        }
    });
    /**
    * @note @angular authorization
    * on route change check if user is signed in with dropbox
    * @link http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/
    */
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        //$log.debug('$routeChangeStart', event, next, current);
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
    $rootScope.$on('$routeChangeSuccess', function () {
        $anchorScroll();
    });
});

