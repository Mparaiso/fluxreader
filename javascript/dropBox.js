/**
 * angular dropBox module
 * MANAGE DROPBOX API
 * @dependencies dropbox-datastores-1.0-latest.js
 */
angular.module('dropbox', [])
    .provider('dropboxClient', function () {
        /**
         * DROPBOX API
         * service configuration
         */
        var _key, _client, _accountInfo;

        return {
            setKey: function (value) {
                _key = value;
                return this;
            },
            getKey: function () {
                return _key;
            },
            authenticationCallback: function (error) {
                if (error) {
                    console.log('authentication error', error);
                }
            },
            /* service */
            $get: function ($q) {
                return {
                    get client() {
                        if (!_client) {
                            this.init();
                        }
                        return _client;
                    },
                    set client(value) {
                        _client = value;
                    },
                    init: function () {
                        _client = new Dropbox.Client({key: _key});
                        _client.authenticate({interactive: false}, this.authenticationCallback);
                    },
                    /* sign in */
                    signIn: function () {
                        _client.authenticate();
                    },
                    /* sign out */
                    signOut: function () {
                        var deferred = $q.defer();
                        _client.signOut(function (error) {
                            if (error) {
                                return deferred.reject(error);
                            }
                            return deferred.resolve();
                        });
                        return deferred.promise;
                    },
                    isAuthenticated: function () {
                        return _client.isAuthenticated();
                    },
                    getDatastoreManager: function () {
                        this.client.getDatastoreManager()
                    },
                    /* get account info */
                    getAccountInfo: function () {
                        var defer = $q.defer();
                        /* @link https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.getAccountInfo */
                        _client.getAccountInfo({httpCache: true}, function (error, accountInfo, obj) {
                            if (error) {
                                defer.reject(error);
                            } else {
                                console.log(accountInfo);
                                defer.resolve(accountInfo);
                            }
                        });
                        return defer.promise;
                    }
                }
            }
        };
    });
