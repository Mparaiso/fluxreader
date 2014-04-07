/**
 * MANAGE DROPBOX API
 * @dependencies dropbox-datastores-1.0-latest.js
 */
angular.module('dropBox', [])
    .provider('dropBoxClient', function () {
        /**
         * DROPBOX API
         */
        var _key, _client;

        return {
            setKey: function (value) {
                _key = value;
                return this;
            },
            getKey: function () {
                return _key;
            },
            getClient: function () {
                return _client;
            },
            $get: function ($log) {
                _client = new Dropbox.Client({key: _key});
                //noinspection UnnecessaryLocalVariableJS
                var client = {
                    init: function () {
                        _client.authenticate({interactive: false}, function (error) {
                            if (error) {
                                $log.log('authentication error', error);
                            }
                        });
                        if (_client.isAuthenticated()) {
                            this.setIsAuthenticated(true);
                        }
                    },
                    setIsAuthenticated: function (value) {
                        this._isAuthenticated = !!value;
                    },
                    isAuthenticated: function () {
                        return this._isAuthenticated;
                    }
                };
                return client;
            }
        }
    });