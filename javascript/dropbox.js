/*global angular,Dropbox*/
/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
(function () {
    "use strict";
    /**
     * angular dropBox module
     * MANAGE DROPBOX API
     * @dependencies dropbox-datastores-1.0-latest.js
     */
    angular.module('dropbox', []) 
        .constant('DROPBOX_APIKEY', 'jze8pzfye506das' /* override with your api key */ )
        .factory('client', function (DROPBOX_APIKEY){
            return new Dropbox.Client({
                key: DROPBOX_APIKEY
            });
        })
        .provider('dropboxClient', function () {
            /**
             * DROPBOX API
             * service configuration
             */
            return {
                /* service */
                $get: function ($timeout,client) {
                    return {
                        authenticate:function(callback){
                            callback=callback||function(){};
                            client.authenticate({
                                interactive: false
                            },callback);
                        },
                        /* sign in */
                        signIn: function () {
                            client.authenticate();
                        },
                        /* sign out */
                        signOut: function (callback) {
                            client.signOut(callback);
                        },
                        isAuthenticated: function () {
                            return client.isAuthenticated();
                        },
                        getDatastoreManager: function () {
                            return client.getDatastoreManager();
                        },
                        /* get account info */
                        getAccountInfo: function (callback) {
                            client.getAccountInfo({
                                httpCache: true
                            }, callback);
                            /* @link https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.getAccountInfo */

                        }
                    };
                }
            };
        });
}());
