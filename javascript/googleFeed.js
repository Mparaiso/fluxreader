(function (window, google, undefined) {
    angular.module('googleFeed', [])
        /* feed service */
        .provider('feed', function () {
            var initialized = false;
            return {
                $get: function ($q, $timeout) {
                    return {
                        /* load a feed according to its url */
                        findFeedByUrl: function (feedUrl) {
                            var defer = $q.defer();
                            var feed = new google.feeds.Feed(feedUrl);
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
                                google.load('feeds', '1', {callback: function () {
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
