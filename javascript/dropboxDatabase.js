/*jslint white:true,es5:true,browser:true,devel:true,nomen:true*/
/*global angular,async*/
/** javascript/dropboxDatabase.js */
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
(function () {
    "use strict";

    /**
     * A database table with CRUD methods,implementing the
     * datamapper design patter
     * a record is a javascript object that has an id.
     * This implementation relies on dropbox datastore table model
     * @constructor
     * @param {string} tableName
     * @param {object} database
     * @param {Function} timeout
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
        delete: function (record, callback) {
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
        .service('database', function (dropboxClient, $timeout) {
            var datastore;
            /**
             * open default datastore
             * @param  {Function} callback
             * @return {void}
             */
            this.open = function (callback) {
                if (datastore === undefined) {
                    var datastoreManager = dropboxClient.getDatastoreManager();
                    datastoreManager.openDefaultDatastore(function (err, _datastore) {
                        datastore = _datastore;
                        callback(err, datastore);
                    });
                } else {
                    $timeout(callback.bind(null, null, datastore));
                }
            };
        })
        .service('tableFactory', function (database, $q, $timeout) {
            this.Table = Table;
            /**
             * create a new table object
             * @param tableName
             * @return {Table}
             */
                this.create = function (tableName) {
                    return new this.Table(tableName, database, $timeout);
                };
        })
        .service('Configuration', function (tableFactory) {
            var configurationTable = tableFactory.create('configuration');
            /**
             * @TODO complete
             */
        })
        .service('File', function (client,$q,Promisifier) {
            var writeFile,readFile,removeFile;
            writeFile=Promisifier.promisify(client.writeFile,client);
            readFile=Promisifier.promisify(client.readFile,client);
            removeFile =Promisifier.promisify(client.remove,client);
            /** writes a file */
            this.write=function(path,content){
                return writeFile(path,content);
            };
            /** read a file */
            this.read=function(path){
                return readFile(path);
            };
            /** remove a file */
            this.remove=function(path){
                return removeFile(path);
            };
        })
        .service('Entry', function (tableFactory,md5,File) {
            /**
             * Manage entry persistance
             */
            var entryTable,feedTable;
            /**
             * @type {database.Table}
             */
            entryTable = tableFactory.create('entry');
            this.getTable = function () {
                return entryTable;
            };
            this.setTable = function (value) {
                entryTable = value;
                return this;
            };
            this.getById = function (id, callback) {
                entryTable.get(id, function(err,entry){
                    if(err){
                        return callback(err);
                    }
                    File.read(entry.path).then(function(content){
                        entry.content = content;
                        callback(null,entry);
                    }).catch(function(err){
                        callback(err);
                    });
                });
            };
            this.getCorrectDate = function (date) {
                var potentialDate = (new Date(date)).getTime();
                if (isNaN(potentialDate) || potentialDate === null) {
                    potentialDate = (new Date()).getTime();
                }
                return potentialDate;
            };
            this.extractMediaGroups = function (entry) {
                if (entry.mediaGroups instanceof Array) {
                    return entry.mediaGroups.map(function (group) {
                        if (group.contents instanceof Array) {
                            return group.contents.map(function (content) {
                                return content.url;
                            });
                        }
                    }).reduce(function (result, next) {
                        result.push.apply(result, next);
                        return result;
                    }, []);
                }
                return [];
            };
                this.normalize = function (entry) {
                    return {
                        //mediaGroup: typeof(entry.mediaGroup) !== 'string' ? entry.mediaGroup !== undefined ? JSON.stringify(entry.mediaGroup) : "{}" : entry.mediaGroup,
                        title: entry.title || "",
                        link: entry.link || "",
                        path:entry.path||"",
                        contentSnippet: entry.contentSnippet || "",
                        publishedDate: this.getCorrectDate(entry.publishedDate),
                        categories: entry.categories || [],
                        medias: entry.medias || [],
                        createdAt: (new Date()).getTime(),
                        feedId: entry.feedId || "",
                        favorite: !!entry.favorite,
                        read: !!entry.read,
                        deleted: !!entry.deleted,
                        compressed: !!entry.compressed
                    };
                };
            this.delete = function (entry, callback) {
                return entryTable.delete(entry, function(err,res){
                    if(err){
                        return callback(err);
                    }
                    return File.remove(entry.path).then(function(){
                        //console.log('remove');
                        return callback(null,res);
                    }).catch(function(err){
                        return callback(err);
                    });
                });
            };
            this.findAll = function () {
                entryTable.findAll.apply(entryTable, [].slice.call(arguments));
            };
            /**
             * insert a new entry
             * if link already found in Entry table,no insert is necessary
             * entries are unique.
             * @param entry
             * @param callback
             */
            this.insert = function (entry, callback) {
                var self = this;
                entryTable.find({link: entry.link, feedId: entry.feedId}, function (err, entryRecord) {
                    //console.log('checking entry if exists', arguments);
                    if (err) {
                        callback(err);
                    } else if (entryRecord) {
                        //entry exists
                        callback(err, entryRecord);
                    } else {
                        //console.log('inserting', entry);
                        /** set file name related to the entry */
                        entry.path = md5(entry.link).concat('.html');
                        File.write(entry.path,entry.content).then(function(){
                            delete entry.content;
                            return entryTable.insert(self.normalize(entry), callback);
                        }).catch(function(err){
                            callback(err);
                        });
                    }
                });
            };
            this.update = function (entry, callback) {
                var _entry = angular.copy(entry);
                delete _entry.feed;
                entryTable.update(_entry, callback);
            };
            /* favorite on unfavorite an entry */
            this.toggleFavorite = function (entry, callback) {
                entry.favorite = !entry.favorite;
                this.update(entry, callback);
            };
            /* mark an entry as read */
            this.markAsRead = function (entry, callback) {
                entry.read = true;
                this.getTable().update(entry, callback);
            };
        })
        .service('Feed', function (tableFactory, Entry, feedFinder, $timeout) {
            /**
             * Manage feed persistance
             */
            var feedTable = tableFactory.create('feed');
            /**
             * remove feed and remove any associated entry
             * @param feed
             * @param {Function} callback
             */
            this.delete = function (feed, callback) {
                feedTable.delete(feed, function (err, feed) {
                    if (feed && feed.id) {
                        Entry.findAll({feedId: feed.id}, function (err, entries) {
                            async.forEach(entries, function (entry, next) {
                                Entry.delete(entry, next);
                            }, callback);
                        });
                    }
                });
            };
            /**
             * get one feed by id
             * @param id
             * @param callback
             */
            this.getById = function (id, callback) {
                feedTable.get(id, callback);
            };
            this.findAll = function (query, callback) {
                feedTable.findAll(query, callback);
            };
            /**
             * insert a new feed,feeds are unique
             * @param feed
             * @param callback
             */
            this.insert = function (feed, callback) {
                var entries = feed.entries;
                delete feed.entries;
                feedTable.find({feedUrl: feed.feedUrl}, function (err, feedRecord) {
                    if (err) {
                        console.warn('err', err);
                        callback(err);
                    } else if (feedRecord) {
                        //dont insert feed since exists
                        async.each(entries, function (entry, next) {
                            //dont insert feeds that dont have an entry
                            if (entry && entry.link) {
                                entry.feedId = feedRecord.id;
                                Entry.insert(entry, next);
                            } else {
                                next();
                            }
                        }, function (err) {
                            return callback(err, feedTable.recordToHash(feedRecord));
                        });
                    } else {
                        //insert since doesnt exist
                        feed.createdAt = Date.now();
                        feedTable.insert(feed, function (err, feedRecord) {

                            async.eachSeries(entries, function (entry, next) {
                                if (entry && entry.link) {
                                    entry.feedId = feedRecord.getId();
                                    Entry.insert(entry, next);
                                } else {
                                    next();
                                }
                            }, function (err) {
                                return callback(err, feedTable.recordToHash(feedRecord));
                            });
                        });
                    }
                });
            };
            this.subscribe = function (url, callback) {
                var self = this;
                if (url) {
                    return feedFinder.open(function () {
                        return feedFinder.findFeedByUrl(url, function (err, feed) {
                            if (feed) {
                                self.insert(feed, callback);
                            } else {
                                return callback(new Error(['Feed not found at ', url].join('')));
                            }
                        });
                    });
                } 
                    return $timeout(callback.bind(null, new Error('no url provided')), 1);
                
            };
        })
        .service('FeedCache', function (Feed, $timeout, $q) {
            /* simple way to keep feeds in memory */
            var self = this;
            this.getById = function (id) {
                return this.load().then(function (feeds) {
                    return $timeout(function () {
                        return feeds.filter(function (feed) {
                            return id === feed.id;
                        })[0];
                    });
                });
            };
            this.load = function (forceReload) {
                var deferred = $q.defer();
                if (this.feeds && !forceReload) {
                    $timeout(deferred.resolve.bind(deferred, this.feeds));
                } else {
                    Feed.findAll(function (err, feeds) {
                        self.feeds = feeds || [];
                        deferred.resolve(feeds);
                    });
                }
                return deferred.promise;
            };
            this.subscribe = function (url) {
                var deferred = $q.defer();
                Feed.subscribe(url, function (err, res) {
                    if (err) {
                        return deferred.reject(err);
                    }
                    deferred.resolve(res);
                });
                return deferred.promise;
            };
        })
        .service('EntryCache', function (Entry, FeedCache, $q, $timeout) {
            /* simple way to keep entries in memory to speed things up */
            var self = this;
            /*this.getCount = function () {/*@todo
            };
            this.getFavoriteCount = function () {/*@todo
            };
            this.getUnreadCount = function () {/*@todo
            };*/
            this.getCategories = function () {
                if (this.entries instanceof Array) {
                    return this.entries.reduce(function (categories, entry) {
                        entry.categories.forEach(function (category) {
                            if (categories.indexOf(category) < 0) {
                                categories.push(category);
                            }
                        });
                        return categories;
                    }, []);
                }
            };
            /**
             *
             * @param query
             * @returns {Promise}
             */
            this.load = function (query) {
                query = query || {};
                return FeedCache.load().then(function () {
                    var deferred = $q.defer();
                    Entry.findAll(query, function (err, entries) {
                        console.warn(err);
                        self.entries = entries || [];
                        entries.forEach(function (entry) {
                            entry.feed = FeedCache.feeds.filter(function (feed) {
                                return feed.id === entry.feedId;
                            })[0];
                        });
                        deferred.resolve(self.entries);
                    });
                    return deferred.promise;
                });
            };
            this.delete = function (entry) {
                var self = this, deferred = $q.defer();
                Entry.delete(entry, function (err, res) {
                    console.warn('entry deletion failed', err);
                    var index = self.entries.indexOf(self.entries.filter(function (e) {
                        return e.id === entry.id;
                    })[0]);
                    self.entries.splice(index, 1);
                    deferred.resolve(res);
                });
                return deferred.promise;
            };
        });
}());

