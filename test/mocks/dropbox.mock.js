/*jslint devel:true,es5:true*/
/*global angular*/
(function() {
    "use strict";
    angular.module('dropbox.mock', [])
        .factory('dropboxClient', function($timeout) {
            var datastoreMock = {
                getTable: function(tableName) {
                    return {
                        tableName: tableName,
                        insert: function() {
                            return;
                        },
                        query: function() {
                            return [{
                                deleteRecord:function(){return this;}
                            }];
                        }
                    };
                }
            };
            return {
                init: function() {
                    return;
                },
                /* sign in */
                signIn: function() {
                    return;
                },
                /* sign out */
                signOut: function(callback) {
                    $timeout(callback, 1);
                },
                isAuthenticated: function() {
                    return true;
                },
                getDatastoreManager: function() {
                    return {
                        openDefaultDatastore: function(callback) {
                            return $timeout(callback.bind(null, null, datastoreMock), 1);
                        }
                    };
                },
                /* get account info */
                getAccountInfo: function() {
                    return $timeout(angular.noop, 1);
                }
            };
        });
}());