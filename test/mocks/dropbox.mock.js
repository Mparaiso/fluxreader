/*jslint devel:true,es5:true*/
/*global angular*/
angular.module('dropbox.mock', [])
.factory('dropboxClient', function ($q,$timeout) {
    var _client={};
    return {
        get client() {
            return _client;
        },
        init: function () {
        },
        /* sign in */
        signIn: function () {
        },
        /* sign out */
        signOut: function () {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        },
        isAuthenticated: function () {
            return true
        },
        getDatastoreManager:function(){
            return {
                openDefaultDatastore:function(callback){
                    return $timeout(callback.apply(null,null,{}),1);
                }
            }
        },
        /* get account info */
        getAccountInfo: function () {
            var defer = $q.defer();
            defer.resolve();
            return defer.promise;
        }
    };
});
