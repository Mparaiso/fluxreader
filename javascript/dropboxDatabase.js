/*jslint es5:true,browser:true,devel:true*/
/*global angular,async*/
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
(function () {
    "use strict";
    /**
     * @typedef {Object} Table
     * @param {function(record:object,callback:Function)} insert insert a record;
     * @param {function(record:object,callback:Function)} update insert a record;
     * @param {function(record:object,callback:Function)} delete delete a record;
     * @param {function(id:(number|string),callback:Function)} find find a record by id;
     * @param {function(query?:object,callback:Function)} findAll find a collection of records;
     * @param {function(record:object,callback:Function)} findOne find one record;
     */
    /**
     * A database table with CRUD methods,implementing the 
     * datamapper design patter
     * a record is a javascript object that has an id.
     * This implementation relies on dropbox datastore table model
     * 
     * @type {Table}
     * @constructor
     * @param tableName
     * @param database
     * @param timeout
     * @constructor
     */
    function Table(tableName, database, timeout) {
        this._tableName = tableName;
        this._database = database;
        this._timeout = timeout;
    }

    Table.prototype = {
        hashToRecordFields: function (hash) {
            var record = Object.keys(hash).reduce(function (result, key) {
                result[key] = hash[key];
                return result;
            }, {});
            delete record.id;
            return record;
        },
        recordToHash: function (record) {
            var fields;
            if (record.getFields instanceof Function) {
                fields = record.getFields();
                fields.id = record.getId();
                Object.keys(fields).forEach(function (key) {
                    if (fields[key] && (fields[key].toArray instanceof Function)) {
                        var val = fields[key].toArray();
                        fields[key] = val;
                    }
                });
            } else {
                fields = record;
            }
            return fields;
        },
        setTable: function (value) {
            this._table = value;
            return this;
        },
        getTable: function (callback) {
            var self = this;
            if (!this._table) {
                this._database.open(function (err, datastore) {
                    self._table = datastore.getTable(self._tableName);
                    callback(err, self._table);
                });
            } else {
                this._timeout(callback.bind(this, null, this._table));
            }
        },
        insert: function (record, callback) {
            this.getTable(function (err, table) {
                var result = table.insert(record);
                callback(undefined, result);
            });
        },
        /**
         * update a record
         * @param record
         * @param {Function} callback
         */
        update: function (record, callback) {
            var self = this;
            this.getTable(function (err, table) {
                var _record = table.get(record.id);
                if (_record) {
                    _record.update(record);
                    callback(err, self.recordToHash(_record));
                } else {
                    callback(new Error(['Record with id ', record.id, ' not found'].join('')));
                }
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
                callback(undefined, null);
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
                    if (datastore === undefined) {
                        var datastoreManager = dropboxClient.getDatastoreManager();
                        datastoreManager.openDefaultDatastore(function (err, _datastore) {
                            datastore = _datastore;
                            callback(err, datastore);
                        });
                    } else {
                        $timeout(callback.bind(null, null, datastore));
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
                 * @return {Table}
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
            var feedTable,
                /**
                 * @type {Table}
                 */
                    entryTable = tableFactory.create('entry');
            return {
                getTable: function () {
                    return entryTable;
                },
                setTable: function (value) {
                    entryTable = value;
                    return this;
                },
                getFeedTable: function () {
                    if (feedTable === undefined) {
                        /*@link http://docs.angularjs.org/api/auto/service/$injector */
                        feedTable = $injector.get('Feed');
                    }
                    return feedTable;
                },
                getById: function (id, callback) {
                    entryTable.get(id, callback);
                },
                normalize: function (entry) {
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
                        favorite: entry.favorite || false,
                        read: entry.read || false
                    };
                },
                delete: function (entry, callback) {
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
                },
                update: function (entry, callback) {
                    var _entry = angular.copy(entry);
                    delete _entry.feed;
                    entryTable.update(_entry, callback);
                },
                /* favorite on unfavorite an entry */
                toggleFavorite: function (entry, callback) {
                    entry.favorite = !entry.favorite;
                    this.update(entry, callback);
                },
                /* mark an entry as read */
                markAsRead: function (entry, callback) {
                    entry.read = true;
                    this.getTable().update(entry, callback);
                }
            };
        })
        .factory('Feed', function (tableFactory, Entry,feedFinder,$timeout) {
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
                getById: function (id, callback) {
                    feedTable.get(id, callback);
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
                    var  entries = feed.entries;
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
                },
                subscribe:function(url,callback){
                    var self=this;
                    if (url) {
                        feedFinder.open(function () {
                            feedFinder.findFeedByUrl(url, function (err, feed) {
                                self.insert(feed, callback);
                            });
                        });
                    }else{
                        $timeout(callback.bind(null,new Error('no url provided')),1);
                    }
                }
            };
        })
        .service('FeedCache', function (Feed,$timeout,$q) {
            /* simple way to keep feeds in memory */
            var self = this;
            this.getById=function(id){
                return this.load().then(function(feeds){
                    return $timeout(function(){
                          return feeds.filter(function(feed){
                        return id===feed.id;
                        })[0];
                    });
                });
            };
            this.load = function (forceReload) {
                var deferred=$q.defer();
                if(this.feeds && !forceReload){
                    $timeout(deferred.resolve.bind(deferred,this.feeds));
                }else{
                    Feed.findAll(function (err, feeds) {
                        self.feeds = feeds||[];
                        deferred.resolve(feeds);
                    });
                }
                return deferred.promise;
            };
        })
        .service('EntryCache', function (Entry,FeedCache,$q,$timeout) {
            /* simple way to keep entries in memory to speed things up */
            var self = this;
            this.remove = function (entry) {
                this.entries.some(function (e, i) {
                    if (e.id === entry.id) {
                        this.entries.splice(i, 1);
                        return true;
                    }
                    return false;
                }, this);
            };
            this.getCategories=function(){
                if(this.entries instanceof Array){
                    return this.entries.reduce(function(categories,entry){
                        entry.categories.forEach(function(category){
                            if(categories.indexOf(category)<0){
                                categories.push(category);
                            }
                        });
                        return categories;
                    },[]);
                }
            };
            this.load = function (query) {
                query=query||{};
                return FeedCache.load().then(function(){
                    var deferred=$q.defer();
                    Entry.findAll(query,function(err,entries){
                        console.log(err);
                        self.entries=entries||[];
                        entries.forEach(function(entry){
                            entry.feed=FeedCache.feeds.filter(function(feed){
                                return feed.id===entry.feedId;
                            })[0];
                        });
                        deferred.resolve(self.entries);
                    });
                    return deferred.promise;
                });
            };
        });
}());