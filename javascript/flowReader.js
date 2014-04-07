/**
 * @copyright mparaiso <mparaiso@online.fr>
 * @license LGPL
 * dependencies dropBox.js googleFeed.js angular.js angular-route.js
 */
(function (undefined) {
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
                    controller: 'SignInCtrl',
                    templateUrl: baseUrl.concat('templates/private.html'),
                    authenticated: true
                })
                .otherwise({redirectTo: '/'});
            //$locationProvider.html5Mode(true);
            dropBoxClientProvider.setKey('aa8d82y2a6iqbs9');
        })
        .constant('baseUrl', window.location.pathname)
        .value('globals', {title: 'Flow Reader'})
        .controller('MainCtrl', function ($log, $scope, globals) {
            $scope.title = globals.title;
            $log.debug('main');
        })
        .controller('IndexCtrl', function ($log) {
            $log.debug('index');
        })
        .controller('SignInCtrl', function ($log) {
            $log.debug('signin')
        })
        .controller('AuthenticatedCtrl', function ($log) {
            $log.debug('authenticated');
        })
        .run(function (dropBoxClient, $location, $route, $rootScope, $log) {
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
                    } else {
                        $location.path('/private');
                    }
                }
            })
        });
}());
