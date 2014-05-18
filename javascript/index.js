/*jslint browser:true,eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular*/
/* javascript/index.js*/
(function() {
    "use strict";
    angular.module('index', ['dropbox','ngRoute'])
        .constant('forceHTTPS', true)
        .constant('baseUrl', window.location.pathname.match(/(.*\/)/)[1])
        .value('globals', {
            siteTitle: 'Flux Reader',
            title: 'Flux Reader',
            email: 'mparaiso@online.fr',
            url: window.location.origin,
            year: (new Date()).getFullYear()
        })
    .controller('IndexCtrl',angular.noop)
    .controller('MainCtrl', function ($scope,$anchorScroll, globals, dropboxClient, baseUrl) {
            $scope.globals = globals;
            $scope.baseUrl = baseUrl;
            $scope.isAuthenticated = function () {
                return dropboxClient.isAuthenticated();
            };
    })
    .run(function (dropboxClient, $location,$anchorScroll, $route, $rootScope, $log, forceHTTPS, $window) {
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
        });
}());

