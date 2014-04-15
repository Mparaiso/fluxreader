/*jslint es5:true*/
/*global angular,Dropbox*/
(function() {
    "use strict";
    /**
     * angular dropBox module
     * MANAGE DROPBOX API
     * @dependencies dropbox-datastores-1.0-latest.js
     */
    angular.module('dropbox', [])
        .constant('KEY',"")
        .factory('client',function(KEY){
            return new Dropbox.Client({key:KEY});
        })
        .provider('dropboxClient', function() {
            /**
             * DROPBOX API
             * service configuration
             */
            return {
                authenticationCallback: function(error) {
                    if (error) {
                        console.log('authentication error', error);
                    }
                },
                /* service */
                $get: function(client) {
                    client.authenticate({
                        interactive: false
                    }, this.authenticationCallback);
                    return {
                        /* sign in */
                        signIn: function() {
                            client.authenticate();
                        },
                        /* sign out */
                        signOut: function(callback) {
                            client.signOut(callback);
                        },
                        isAuthenticated: function() {
                            return client.isAuthenticated();
                        },
                        getDatastoreManager: function() {
                            client.getDatastoreManager();
                        },
                        /* get account info */
                        getAccountInfo: function(callback) {
                            /* @link https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.getAccountInfo */
                            client.getAccountInfo({
                                httpCache: true
                            }, callback);
                        }
                    };
                }
            };
        });
}());