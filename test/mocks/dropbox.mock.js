/*jslint devel:true,es5:true*/
/*global angular*/
/* test/mocks/dropbox.mock.js */
(function () {
    "use strict";
    angular.module('dropbox.mock', [])
        .service('client',function(){
            return jasmine.createSpyObj('client',['writeFile','readFile','remove']);
        })
        .factory('dropboxClient', function ($timeout) {
            var RecordMock = function () {
                this.getFields = function () {
                    return {};
                };
                this.getId = function () {
                };
                this.update = function () {
                };
            };

            var datastoreMock = {

                getTable: function (tableName) {
                    return {
                        get: function () {
                            return new RecordMock();
                        },
                        tableName: tableName,
                        insert: function () {
                            return;
                        },
                        query: function () {
                            return [
                                {
                                    deleteRecord: function () {
                                        return this;
                                    }
                                }
                            ];
                        }
                    };
                }
            };
            return {
                authenticate: function () {
                },
                init: function () {
                    return;
                },
                /* sign in */
                signIn: function () {
                    return;
                },
                /* sign out */
                signOut: function (callback) {
                    $timeout(callback, 1);
                },
                isAuthenticated: function () {
                    return true;
                },
                getDatastoreManager: function () {
                    return {
                        openDefaultDatastore: function (callback) {
                            return $timeout(callback.bind(null, null, datastoreMock), 1);
                        }
                    };
                },
                /* get account info */
                getAccountInfo: function () {
                    return $timeout(angular.noop, 1);
                }
            };
        });
}());
