angular.module('$window.mock',[])
    .factory('$window', function () {
        return {
            prompt: function (value) {
                return value
            }
        }
    });