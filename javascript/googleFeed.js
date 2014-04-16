/*globals angular,google */
(function (window, google, undefined) {
    "use strict";
    angular.module('googleFeed', [])
        /* feed service */
        .provider('feedFinder', function () {
            var _google, initialized = false;
            return {
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
                        /* load a feed according to its url */
                        findFeedByUrl: function (feedUrl, callback) {
                            var feed = new _google.feeds.Feed(feedUrl);
                            feed.includeHistoricalEntries();
                            feed.setNumEntries(30);
                            feed.load(function (result) {
                                callback(result.error, result.feed);
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
}(this, google));