/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*globals angular,google */
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";
angular.module('googleFeed', [])
.provider('feedFinder', function () {
    /* feed service */
    var numEntries = 30, _google, initialized = false;
    return {
        /** set max entry number when fetching feed entries*/
        setNumEntries: function (number) {
            numEntries = number;
        },
        /* set google object */
        setGoogle: function (google) {
            _google = google;
            return this;
        },
        getGoogle: function () {
            if (_google === undefined) {
                console.log('using default google global variable');
                _google = google;
            }
            return _google;
        },
        $get: function ($q, $timeout) {
            return {
                /* load a feed according to its syndication url */
                findFeedByUrl: function (feedUrl, callback) {
                    var self=this,feed = new _google.feeds.Feed(feedUrl);
                    feed.includeHistoricalEntries();
                    feed.setNumEntries(numEntries);
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
                },
                /* create a feed loader if undefined */
                open: function (callback) {
                    if (!initialized) {
                        _google.load('feeds', '1', {
                            callback: callback
                        });
                    } else {
                        $timeout(callback, 1);
                    }

                }
            };
        }
    };
});
