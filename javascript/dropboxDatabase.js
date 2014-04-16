/*jslint es5:true,browser:true,devel:true*/
/*global angular,async*/
(function () {
    "use strict";
    function Table(tableName, database, timeout) {
        this._tableName = tableName;
        this._database = database;
        this._timeout = timeout;
    }

    Table.prototype = {
        recordToHash: function (record) {
            var fields;
            if (record.getFields instanceof Function) {
                fields = record.getFields();
                fields.id = record.getId();
            } else {
                fields = record;
            }
            return fields;
        },
        getTable: function (callback) {
            var self = this;
            if (!this._table) {
                this._database.open(function (err, datastore) {
                    self._table = datastore.getTable(self._tableName);
                    callback(err, self._table);
                });
            } else {
                self._timeout(callback.bind(null, null, self._table), 1);
            }
        },
        insert: function (record, callback) {
            this.getTable(function (err, table) {
                var result = table.insert(record);
                callback(null, result);
            });
        },
        /**
         * get record by id
         * @param {String} id
         * @param {Function} callback
         */
        get: function (id, callback) {
            var self = this;
            this.getTable(function (err, table) {
                var record = table.get(id);
                callback(err, self.recordToHash(record));
            });
        },
        'delete': function (record, callback) {
            if (record !== undefined && record.id !== undefined) {
                this.getTable(function (err, table) {
                    var r = table.get(record.id);
                    if (r) {
                        r.deleteRecord();
                        callback(err, record);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        findAll: function (query, callback) {
            var self = this;
            if (query instanceof Function) {
                callback = query;
                query = {};
            }
            this.getTable(function (err, table) {
                var records = table.query(query);
                callback(err, records.map(function (record) {
                    return self.recordToHash(record);
                }));
            });
        },
        find: function (query, callback) {
            this.findAll(query, function (err, records) {
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
        .factory('database', function (dropboxClient, $timeout) {
            var datastore;
            return {
                /**
                 * open default datastore
                 * @param  {Function} callback
                 * @return {void}
                 */
                open: function (callback) {
                    if (!datastore) {
                        var datastoreManager = dropboxClient.getDatastoreManager();
                        datastoreManager.openDefaultDatastore(function (err, _datastore) {
                            datastore = _datastore;
                            callback(err, datastore);
                        });
                    } else {
                        $timeout(callback.bind(null, null, datastore), 1);
                    }
                }
            };
        })
        .factory('tableFactory', function (database, $q, $timeout) {
            return {
                Table: Table,
                /**
                 * create a new table object
                 * @param tableName
                 */
                create: function (tableName) {
                    return new this.Table(tableName, database, $timeout);
                }
            };
        })
        .factory('Entry', function (tableFactory) {
            /**
             * Manage entry persistance
             */
            var entryTable = tableFactory.create('entry');
            return {
                normalize: function (entry) {
                    console.log(entry);
                    return {
                        //mediaGroup: typeof(entry.mediaGroup) !== 'string' ? entry.mediaGroup !== undefined ? JSON.stringify(entry.mediaGroup) : "{}" : entry.mediaGroup,
                        title: entry.title || "",
                        link: entry.link || "",
                        content: entry.content || "",
                        contentSnippet: entry.contentSnippet || "",
                        publishedDate: (new Date(entry.publishedDate)).getTime(),
                        categories: entry.categories || [],
                        createdAt: (new Date()).getTime(),
                        feedId: entry.feedId || "",
                        favorite: entry.favorite || false
                    };
                },
                'delete': function (entry, callback) {
                    entryTable.delete(entry, callback);
                },
                findAll: function () {
                    entryTable.findAll.apply(entryTable, [].slice.call(arguments));
                },
                /**
                 * insert a new entry
                 * if link already found in Entry table,no insert is necessary
                 * entries are unique.
                 * @param entry
                 * @param callback
                 */
                insert: function (entry, callback) {
                    var self = this;
                    entryTable.find({link: entry.link, feedId: entry.feedId}, function (err, entryRecord) {
                        if (entryRecord || err) {
                            callback(err, entryRecord);
                        } else {
                            entry = self.normalize(entry);
                            entryTable.insert(entry, callback);
                        }
                    });
                }
            };
        })
        .factory('Feed', function (tableFactory, Entry) {
            /**
             * Manage feed persistance
             */
            var feedTable = tableFactory.create('feed');
            return {
                /**
                 * remove feed and remove any associated entry
                 * @param feed
                 * @param {Function} callback
                 */
                'delete': function (feed, callback) {
                    feedTable.delete(feed, function (err, feed) {
                        if (feed && feed.id) {
                            Entry.findAll({feedId: feed.id}, function (err, entries) {
                                async.forEach(entries, function (entry, next) {
                                    Entry.delete(entry, next);
                                }, callback);
                            });
                        }
                    });
                },
                /**
                 * get one feed by id
                 * @param id
                 * @param callback
                 */
                getFeedById: function (id, callback) {
                    feedTable.get(id, function (err, feed) {
                        var _feed;
                        if (feed) {
                            _feed = feed.getFields();
                            _feed.id = feed.getId();
                        }
                        callback(err, _feed);
                    });
                },
                findAll: function (query, callback) {
                    feedTable.findAll(query, callback);
                },
                /**
                 * insert a new feed,feeds are unique
                 * @param feed
                 * @param callback
                 */
                insert: function (feed, callback) {
                    var self = this, entries = feed.entries;
                    delete feed.entries;
                    feedTable.find({feedUrl: feed.feedUrl}, function (err, feedRecord) {
                        if (err || feedRecord) {
                            //dont insert feed since exists
                            async.each(entries, function (entry, next) {
                                entry.feedId = feedRecord.id;
                                Entry.insert(entry, next);
                            }, function (err) {
                                return callback(err, feedTable.recordToHash(feedRecord));
                            });
                        } else {
                            //insert since doesnt exist
                            feed.createdAt = Date.now();
                            feedTable.insert(feed, function (err, feedRecord) {

                                async.each(entries, function (entry, next) {
                                    entry.feedId = feedRecord.getId();
                                    Entry.insert(entry, next);
                                }, function (err) {
                                    return callback(err, feedTable.recordToHash(feedRecord));
                                });
                            });
                        }
                    });
                }
            };
        });
}());