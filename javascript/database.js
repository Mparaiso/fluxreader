angular.module('database', [])
    .service('database', function (dropBoxClient, $q) {
        return {
            open: function () {
                var self = this, deferred = $q.defer();
                if (!this._datastore) {
                    dropBoxClient.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
                        if (error) {
                            return deferred.reject(error);
                        }
                        self._datastore = datastore;
                        return deferred.resolve(self._datastore);
                    });
                    return deferred.promise;
                } else {
                    return $timeout(function () {
                        return self._datastore
                    }, 1);
                }

            }
        }
    })
    .service('Feed', function (database, $q, $timeout) {
        var tableName = "feed";
        var table;
        return {
            insert: function (feed) {
                return this.open().then($timeout(function () {
                    return table.insert(feed);
                }, 1));
            },
            open: function () {
                return database.open().then($timeout(function () {
                    table = datastore.getTable(tableName);
                    return table;
                }, 1));
            }
        }
    });
