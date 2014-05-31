/*jslint white:true,es5:true,browser:true,devel:true,nomen:true*/
/*global angular,async,google,Dropbox*/
/** javascript/dropboxDatabase.js */
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";
/**
 * @namespace
 */
var fluxreader=fluxreader||{};
/**
 * A database table with CRUD methods,implementing the
 * datamapper design patter
 * a record is a javascript object that has an id.
 * This implementation relies on dropbox datastore table model
 * @constructor
 * @param {string} tableName
 * @param {object} database
 * @param {Function} timeout
 */
fluxreader.Table=(function(){
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
        /**
        * @param {object} record
        */
        recordToHash: function (record) {
            if(!record){
                return;
            }
            var fields={};
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
        /** open dropbox database,get datastore,get table by name */
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
        * @param {object} record
        * @param {Function} callback
        */
        update: function (record, callback) {
            //console.log(record);
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
    return Table;
}());

/**
 * @constructor
 */
fluxreader.File = function (client,$q,Promisifier) {
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
};

/**
 * @constructor
 * @param {Dropbox.Client} dropboxClient
 * @param {Function} $timeout
 */
fluxreader.Database = function (dropboxClient, $timeout) {
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
};

/**
 * @constructor
 * @param {fluxreader.Database} database
 * @param {Promise} $q
 * @param {Function} $timeout
 * @param {fluxreader.Table} Table
 */
fluxreader.TableFactory=function (database, $q, $timeout,Table) {
    this.Table = Table;
    /**
    * create a new table object
    * @param tableName
    * @return {Table}
    */
    this.create = function (tableName) {
        return new this.Table(tableName, database, $timeout);
    };
};

/**
 * @constructor
 * @param {fluxreader.TableFactory} tableFactory
 * @param {Function} md5
 * @param {fluxreader.File} File
 */
fluxreader.Entry=function (tableFactory,md5,File) {
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
            if(!entry){
                return callback(new Error('Entry not found'));
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
        //console.log('mediaGroups',entry);
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
        var normalized= {
            //mediaGroup: typeof(entry.mediaGroup) !== 'string' ? entry.mediaGroup !== undefined ? JSON.stringify(entry.mediaGroup) : "{}" : entry.mediaGroup,
            title: entry.title || "",
            link: entry.link || "",
            path:entry.path||"",
            contentSnippet: entry.contentSnippet || "",
            publishedDate: this.getCorrectDate(entry.publishedDate),
            categories: entry.categories || [],
            medias: entry.medias || this.extractMediaGroups(entry) ,
            createdAt: entry.createdAt||Date.now(),
            updatedAt:Date.now(),
            feedId: entry.feedId || "",
            favorite: !!entry.favorite,
            read: !!entry.read,
            deleted: !!entry.deleted,
            compressed: !!entry.compressed
        };
        if(entry.id){
            normalized.id=entry.id;
        }
        return normalized;
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
    /**
    * @param {Object} query
    * @param {Function} callback
    */
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
        //check if entry exists
        entryTable.find({link: entry.link, feedId: entry.feedId}, function (err, entryRecord) {
            if (err) {
                callback(err);
            } else if (entryRecord) {
                //entry exists
                callback(err, entryRecord);
            } else {
                /** set file name related to the entry */
                entry.path = md5(entry.link).concat('.html');
                File.write(entry.path,entry.content).then(function(){
                    var normalized=self.normalize(entry);
                    return entryTable.insert(normalized, callback);
                }).catch(function(err){
                    callback(err);
                });
            }
        });
    };
    this.update = function (entry, callback) {
        var _entry = angular.copy(entry);
        delete _entry.feed;
        entryTable.update(this.normalize(_entry), callback);
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
    this.findFavorites=function(callback){
        return this.findAll({favorite:true},callback);
    };
    this.findUnread=function  (callback) {
        return this.findAll({read:false},callback);
    };
};

/**
 * @constructor
 *
 */
fluxreader.Feed=function (tableFactory, Entry, feedFinder, $timeout,opml) {
    /**
    * Manage feed persistance
    */
    var feedTable = tableFactory.create('feed');
    return {
        _refreshInterval:1000*60*60*24,
        setRefreshInterval:function(value){
            this._refreshInterval=value;
        },
        /**
        * remove feed and remove any associated entry
        * @param feed
        * @param {Function} callback
        */
        delete : function (feed, callback) {
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
        getById : function (id, callback) {

            feedTable.get(id, callback);
        },
        findAll : function (query, callback) {

            feedTable.findAll(query, callback);
        },
        /**
        * should the feed be refreshed
        * @param {Feed} feed
        * @return {Boolean}
        */
        shouldRefresh:function(feed){
            return Date.now() > (feed.refreshedAt+this._refreshInterval);
        },
        /**
        * insert a new feed,feeds are unique
        * @param feed
        * @param callback
        */
        insert : function (feed, callback) {
            var self,entries;
            self=this;
            entries = feed.entries;
            delete feed.entries;
            feedTable.find({feedUrl: feed.feedUrl}, function (err, feedRecord) {
                if (err) {
                    console.warn('err', err);
                    callback(err);
                } else if (feedRecord) {
                    // feed exists,dont insert
                    if(!self.shouldRefresh(feedRecord)){
                        //dont refresh exit
                        return callback(null,feedRecord);
                    }
                    async.each(entries, function (entry, next) {
                        //dont insert feeds that dont have an entry
                        if (entry && entry.link) {
                            entry.feedId = feedRecord.id;
                            Entry.insert(entry, next);
                        } else {
                            next();
                        }
                    }, function (err) {
                        if(err){
                            return callback(err);
                        }
                        feedRecord.refreshedAt=Date.now();
                        feedTable.update(feedRecord,callback);
                    });
                } else {
                    //insert since doesnt exist
                    feed.createdAt = Date.now();
                    feed.refreshedAt= Date.now();
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
        },
        update : function(feed,callback){
            feed.updatedAt=Date.now();
            feedTable.update(feed,callback);
        },
        subscribe : function (url, callback) {
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
        },
        /**
        * import from file
        * @param {window.File} file
        * @param {Function} callback
        * @return {void}
        */
        import:function(file,callback){
            console.log("importing list",file);
            var self=this;
            opml.import(file).then(function(feedUrlList){
                console.log('importing feed list',feedUrlList)
                async.eachSeries(feedUrlList,function(feedUrl,next){
                    $timeout(this.subscribe.bind(this,feedUrl,next),2000);
                },callback);
            });
        },
        /**
        * export to xml string
        * @param {Function} callback
        * @return {void}
        */
        export:function(callback){
            this.findAll(function(err,feeds){
                if(err){
                    return callback(err);
                }
                return callback(null,opml.export(feeds));
            });
        }
    };
};


fluxreader.FeedFinder=function($timeout){
    var _numEntries = 30, _google=google, initialized = false;
    /** set max entry number when fetching feed entries*/
    this.setNumEntries= function (number) {
        _numEntries = number;
    };
    /* set google object */
    this.setGoogle=function (google) {
        _google = google;
        return this;
    };
    /* load a feed according to its syndication url */
    this.findFeedByUrl= function (feedUrl, callback) {
        var self=this,feed = new _google.feeds.Feed(feedUrl);
        feed.includeHistoricalEntries();
        feed.setNumEntries(_numEntries);
        return feed.load(function (result) {
            if(!result.error){
                return callback(result.error, result.feed);
            }
            /*try a search strategy if no feed*/
            return _google.feeds.findFeeds("site:".concat(feedUrl),function(result){
                if(!result.error && result.entries.length>0){
                    console.log(result.entries);
                    return self.findFeedByUrl(result.entries[0].url,callback);
                }
                callback(result.error);
            });
        });
    };
    /* create a feed loader if undefined */
    this.open= function (callback) {
        if (!initialized) {
            _google.load('feeds', '1', {
                callback: callback
            });
        } else {
            $timeout(callback, 1);
        }

    };
};

fluxreader.Client = function(apiKey){
    return new Dropbox.Client({
        key: apiKey
    });
};

fluxreader.DropboxClient = function ($timeout,client) {
    return {
        authenticate:function(callback){
            callback=callback||function(){};
            client.authenticate({
                interactive: false
            },callback);
        },
        /* sign in */
        signIn: function () {
            client.authenticate();
        },
        /* sign out */
        signOut: function (callback) {
            client.signOut(callback);
        },
        isAuthenticated: function () {
            return client.isAuthenticated();
        },
        getDatastoreManager: function () {
            return client.getDatastoreManager();
        },
        /* get account info */
        getAccountInfo: function (callback) {
            client.getAccountInfo({
                httpCache: true
            }, callback);
            /* @link https://www.dropbox.com/developers/datastore/docs/js#Dropbox.Client.getAccountInfo */

        }
    };
};
