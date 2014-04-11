/* globals angular,google */
(function (window, google, undefined) {
    angular.module('googleFeed',[])
        /* feed service */
        .provider('feed', function () {
            var _google, initialized = false;
            return {
                setGoogle: function (google) {
                    _google = google;
                    return this;
                },
                getGoogle: function () {
                    if (_google == null) {
                        console.log('using default google global variable');
                        _google = google;
                    }
                    return _google;
                },
                $get: function ($q, $timeout) {
                    return {
                        /* load a feed according to its url */
                        findFeedByUrl: function (feedUrl) {
                            var defer = $q.defer();
                            var feed = new _google.feeds.Feed(feedUrl);
                            feed.load(function (result) {
                                if (result.error) {
                                    return defer.reject(result.error);
                                }
                                return defer.resolve(result.feed);
                            });
                            return defer.promise;
                        },
                        /* create a feed loader if undefined */
                        open: function () {
                            console.log('open');
                            if (!initialized) {
                                var defer = $q.defer();
                                _google.load('feeds', '1', {callback: function () {
                                    console.log('init', arguments);
                                    initialized = true;
                                    defer.resolve();
                                }});
                                return defer.promise;
                            } else {
                                return $timeout(angular.noop, 1);
                            }

                        }
                    }
                }
            }
        });
}(this, google));
