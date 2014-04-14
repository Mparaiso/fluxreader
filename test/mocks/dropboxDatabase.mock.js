/*jslint es5:true,node:true*/
/*global angular*/
angular.module('dropboxDatabase.mock', [])
    .factory('database', function (dropboxClient, $q) {
        return {
            /**
             * open default datastore
             * @returns {$q.promise}
             */
            open: function () {
                var d = $q.defer();
                d.resolve(this.datastore);
                return d.promise;
            },
            datastore: {
                getTable: function (tableName) {
                    return {
                        tableName: tableName,
                        insert: function () {
                        },
                        query: function () {
                            return [];
                        }
                    };
                }
            }
        }
    });
