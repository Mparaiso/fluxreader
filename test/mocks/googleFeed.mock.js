/* globals angular,google */
angular.module('googleFeed.mock', [])
    /* feed service */
    .provider('feed', function () {
        var _google;
        return {
            setGoogle: function (google) {
                _google = google;
            },
            getGoogle: function () {
                return _google;
            },
            $get: function ($q, $timeout) {
                return {
                    findFeedByUrl: function (feedUrl) {
                        var deferred = $q.defer();
                        $timeout(deferred.resolve.bind(deferred, {}), 1);
                        return deferred.promise;
                    },
                    open: function () {
                        var deferred = $q.defer();
                        $timeout(deferred.resolve.bind(deferred, {}), 1);

                        return deferred.promise;
                    }
                }
            }
        }
    });
