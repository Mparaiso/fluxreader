/*jslint es5:true,node:true*/
/*global angular*/
(function () {
    "use strict";
    var Table = function (tableName, database, timeout, q) {
        Object.defineProperties(this, {
            timeout: {
                get: function () {
                    return timeout
                }
            },
            q: {
                get: function () {
                    return q
                }
            },
            tableName: {
                get: function () {
                    return tableName
                }
            },
            database: {
                get: function () {
                    return database;
                }
            }
        });
    };
    Table.prototype = {
        getTable: function () {
            var self = this;
            if (!this._table) {
                return this.database.open().then(function (datastore) {
                    console.log('Table#getTable');
                    self._table = datastore.getTable(self.tableName);
                    return self.timeout(function () {
                        return self._table;
                    }, 1);
                });
            } else {
                return self.timeout(function () {
                    return self._table;
                }, 1);
            }

        },
        insert: function (record) {
            return this.getTable().then(function (table) {
                return this.timeout(function () {
                    return table.insert(record);
                });
            });
        },
        'delete': function (record) {
            var self = this;
            return this.find({ID: record.ID}).then(function (_record) {
                if (_record) {
                    _record.deleteRecord();
                    delete record.ID;
                    self.timeout(function () {
                        return record;
                    });
                }
            });
        },
        findAll: function () {
            var self = this, args = [].slice.call(arguments);
            return this.getTable().then(function (table) {
                return self.timeout(function () {
                    return table.query.apply(table, args);
                });
            });
        },
        find: function () {
            var self = this;
            return this.findAll.apply(this, [].slice.call(arguments)).then(function (records) {
                return self.timeout(function () {
                    return records[0];
                });
            });
        }
    };
    angular.module('dropboxDatabase', [])
        .factory('database', function (dropboxClient, $q) {
            var datastore, datastoreManager;
            return {
                /**
                 * open default datastore
                 * @returns {$q.promise}
                 */
                open: function () {
                    var d = $q.defer();
                    if (!datastore) {
                        datastoreManager = datastoreManager || dropboxClient.getDatastoreManager();
                        datastoreManager.openDefaultDatastore(function (err, _datastore) {
                            if (err) {
                                d.reject(err);
                            } else {
                                datastore = _datastore;
                                d.resolve(datastore);
                            }
                        });
                    } else {
                        d.resolve(datastore);
                    }
                    return d.promise;
                }
            };
        })
        .factory('tableFactory', function (database, $q, $timeout) {
            return {
                /**
                 * type {Table}
                 */
                Table: Table,
                /**
                 * create a new table object
                 * @param tableName
                 */
                create: function (tableName) {
                    return new this.Table(tableName, database, $timeout, $q);
                }/*end create*/
            };
        });
}());
