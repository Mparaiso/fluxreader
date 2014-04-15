/*jslint es5:true,node:true*/
/*global angular,async*/
(function() {
    "use strict";
    var Table = function(tableName, database, timeout) {
        this._tableName = tableName;
        this._database = database;
        this._timeout = timeout;
    };
    Table.prototype = {
        getTable: function(callback) {
            var self = this;
            if (!this._table) {
                this._database.open(function(err, datastore) {
                    self._table = datastore.getTable(self._tableName);
                    callback(err, self._table);
                });
            } else {
                return self.timeout(function() {
                    return self._table;
                }, 1);
            }
        },
        insert: function(record, callback) {
            this.getTable(function(err, table) {
                var result = table.insert(record);
                callback(null, result);
            });
        },
        delete: function(record, callback) {
            this.find({
                ID: record.ID
            }, function(err, record) {
                if (record) {
                    record.deleteRecord();
                }
                callback(err, record);
            });
        },
        findAll: function(query, callback) {
            this.getTable(function(err, table) {
                var records = table.query(table, query);
                callback(err, records);
            });
        },
        find: function(query, callback) {
            this.findAll(query, function(err, records) {
                var result;
                if (records) {
                    result = records[0];
                }
                callback(err, result);
            });
        }
    };
    angular.module('dropboxDatabase', [])
        .constant('Table', Table)
        .factory('database', function(dropboxClient, $timeout) {
            var datastore, datastoreManager;
            return {
                /**
                 * open default datastore
                 * @param  {Function} callback
                 * @return {void}
                 */
                open: function(callback) {
                    if (!datastore) {
                        datastoreManager = datastoreManager || dropboxClient.getDatastoreManager();
                        datastoreManager.openDefaultDatastore(function(err, _datastore) {
                            datastore = _datastore;
                            callback(err, datastore);
                        });
                    } else {
                        $timeout(callback.bind(null, null, datastore), 1);
                    }
                }
            };
        })
        .factory('tableFactory', function(database, $q, $timeout) {
            return {
                Table: Table,
                /**
                 * create a new table object
                 * @param tableName
                 */
                create: function(tableName) {
                    return new this.Table(tableName, database, $timeout);
                }
            };
        })
        .factory('Entry', function(tableFactory) {
            var entryTable = tableFactory.create('entry');
            return {
                insert: function(entry, callback) {
                    entryTable.insert(entry, callback);
                }
            };
        })
        .factory('Feed', function(tableFactory, Entry) {
            var feedTable = tableFactory.create('feed');
            return {
                insert: function(feed, callback) {
                    var _feed, entries = feed.entries;
                    delete feed.entries;
                    feedTable.insert(feed, function(err, feed) {
                        _feed = feed;
                        async.each(entries, function(entry, next) {
                            Entry.insert(entry, next);
                        }, function(err, result) {
                            return callback(err, _feed);
                        });
                    });

                }
            };
        });
}());