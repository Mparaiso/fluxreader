/*jslint es5:true*/
/*global angular,Dropbox*/
(function () {
    "use strict";
    /**
     * angular dropBox module
     * MANAGE DROPBOX API
     * @dependencies dropbox-datastores-1.0-latest.js
     */
    angular.module('dropbox', [])
        .constant('DROPBOX_APIKEY', "override with your api key")
        .factory('client', function (DROPBOX_APIKEY) {
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
                $get: function (client, $timeout) {

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
