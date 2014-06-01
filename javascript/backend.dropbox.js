/*jslint white:true,es5:true,browser:true,devel:true,nomen:true*/
/*global angular,async*/
/** javascript/dropboxDatabase.js */
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";

angular.module('dropboxDatabase', ['opml'])
.constant('Events',{
    "SUBSCRIBING":"backend.SUBSCRIBING"
})
.constant('Table', fluxreader.Table)
.service('database', fluxreader.Database)
.service('tableFactory', fluxreader.TableFactory)
.service('File', fluxreader.File)
.service('Entry', fluxreader.Entry)
.service('Feed', fluxreader.Feed)
.service('Import',fluxreader.Import)
.service('User',fluxreader.User)
.service('FeedProxy', function (Feed, $timeout, $q) {
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
            return $q.when(this.feeds);
        } 
        Feed.findAll(function (err, feeds) {
            self.feeds = feeds || [];
            deferred.resolve(feeds);
        });
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
.service('EntryProxy', function (Entry, FeedProxy, $q,Promisifier, $timeout,$filter) {
    /* simple way to keep entries in memory to speed things up */
    var self = this;

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
        return FeedProxy.load().then(function () {
            var deferred = $q.defer();
            Entry.findAll(query, function (err, entries) {
                if(err){console.warn(err);}
                self.entries = entries || [];
                entries.forEach(function (entry) {
                    entry.feed = FeedProxy.feeds.filter(function (feed) {
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
            if(err){console.warn('entry deletion failed', err);}
            var index = self.entries.indexOf(self.entries.filter(function (e) {
                return e.id === entry.id;
            })[0]);
            self.entries.splice(index, 1);
            deferred.resolve(res);
        });
        return deferred.promise;
    };
    /**
     * @param {string} query
     * @return {promise}
     */
    this.search=function(query){
        return this.load().then(function(entries){
            self.entries= $filter('filter')(entries,query);
            return self.entries;
        });
    };
    this.update=function(entry){
        var update = Promisifier.promisify(Entry.update,Entry);
        return update(entry);
    };
});

