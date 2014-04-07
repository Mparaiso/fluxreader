/**
 * @copyright mparaiso <mparaiso@online.fr>
 * @license LGPL
 * dependencies dropBox.js googleFeed.js angular.js angular-route.js
 */
(function (window, undefined) {
    angular.module('flowReader', ['ngRoute', 'dropBox', 'googleFeed'],
        function config($routeProvider, $locationProvider, dropBoxClientProvider, baseUrl) {
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
                    templateUrl: baseUrl.concat('templates/signin.html'),
                    authenticated: false
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
            dropBoxClientProvider.setKey('aa8d82y2a6iqbs9');
        })
        .constant('baseUrl', window.location.pathname)
        .value('globals', {title: 'Flow Reader'})
        .controller('MainCtrl', function ($scope, globals, $location, dropBoxClient) {
            $scope.globals = globals;
            $scope.isAuthenticated = function () {
                return dropBoxClient.isAuthenticated();
            };
            //@promise unwrapping deprecated @link https://github.com/angular/angular.js/commit/5dc35b527b3c99f6544b8cb52e93c6510d3ac577
            dropBoxClient.getAccountInfo().then(function (accountInfo) {
                $scope.accountInfo = accountInfo;
            });
            $scope.signOut = function () {
                if (dropBoxClient.isAuthenticated()) {
                    dropBoxClient.signOut().then(function () {
                        $location.path('/');
                    });
                }
            }
        })
        .controller('IndexCtrl', function ($log) {
            $log.debug('index');
        })
        .controller('SignInCtrl', function ($log, dropBoxClient, $scope) {
            $log.debug('signin');
            $scope.signIn = function () {
                dropBoxClient.signIn();
            }
        })
        .controller('DashboardCtrl', function ($log) {
            $log.debug('authenticated');
        })
        .controller('AccountCtrl', function ($scope, dropBoxClient) {
            dropBoxClient.getAccountInfo().then(function (accountInfo) {
                $scope.accountInfo = accountInfo;
            });
        })
        .run(function (dropBoxClient, $location, $route, $rootScope, $log) {
            dropBoxClient.init();//authenticate client
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
                    if (!dropBoxClient.isAuthenticated()) {
                        $location.path('/signin');
                    }
                }
            })
        });
}(this));
