/*global angular,google*/
/**
 * @copyright mparaiso <mparaiso@online.fr>
 * @license LGPL
 * dependencies dropbox.js googleFeed.js angular.js angular-route.js
 */
(function (window, undefined) {
    "use strict";
    angular.module('flowReader', ['ngRoute', 'dropbox', 'googleFeed'],
        function config(feedAPIProvider,$routeProvider, $locationProvider, dropboxClientProvider, baseUrl) {
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
                .otherwise({redirectTo: '/'});
            //$locationProvider.html5Mode(true);
            dropboxClientProvider.setKey('aa8d82y2a6iqbs9');
            feedAPIProvider.setGoogle(google);
        })
        .constant('baseUrl', window.location.pathname)
        .value('globals', {title: 'Flow Reader'})
        .controller('MainCtrl', function ($scope, globals, $location, dropboxClient, baseUrl) {
            $scope.globals = globals;
            $scope.baseUrl = baseUrl;
            $scope.isAuthenticated = function () {
                return dropboxClient.isAuthenticated();
            };
            //@promise unwrapping deprecated @link https://github.com/angular/angular.js/commit/5dc35b527b3c99f6544b8cb52e93c6510d3ac577
            dropboxClient.getAccountInfo().then(function (accountInfo) {
                $scope.accountInfo = accountInfo;
            });
            $scope.signOut = function () {
                if (dropboxClient.isAuthenticated()) {
                    dropboxClient.signOut().then(function () {
                        $location.path('/');
                    });
                }
            };
            $scope.signIn = function () {
                dropboxClient.signIn();
            }
        })
        .controller('IndexCtrl', function ($log) {
            $log.debug('index');
        })
        .controller('DashboardCtrl', function ($log, $scope, $window, feedAPI) {
            $scope.subscribe = function () {
                var url = $window.prompt('Enter the feed URL');
                return feedAPI.open().then(feedAPI.findFeedByUrl.bind(feedAPI, url)).then(function () {
                    console.log('find', arguments);
                });
            };
        })
        .controller('AccountCtrl', function ($scope, dropboxClient) {
            dropboxClient.getAccountInfo().then(function (accountInfo) {
                $scope.accountInfo = accountInfo;
            });
        })
        .run(function (dropboxClient, $location, $route, $rootScope, $log) {
            dropboxClient.init();//authenticate client
            /**
             * @note @angular authorization
             * on route change check if user is signed in with dropbox
             * @link http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/
             */
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
                $log.debug('$routeChangeStart', event, next, current);
                if ($location.path() == '/') {
                    return;
                }
                if (next.authenticated) {
                    if (!dropboxClient.isAuthenticated()) {
                        $location.path('/');
                    }
                }
            })
        });
}(this));
