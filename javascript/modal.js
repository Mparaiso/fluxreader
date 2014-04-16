/**
 * directive for bootstrap-modal
 * @dependency bootstrap.js
 */
angular.module('modal', [])
    .directive('bootstrapModal', function ($log, $window) {
        return{
            //transclude:true,
            link: function ($scope, element, $attributes) {
                console.log(arguments);
                element.addClass('modal');
                element.addClass('false');
                element.modal({show:false});
                $scope.$watch($attributes['data-show'], function (old, _new, $scope) {
                    $log.debug('show modal', arguments);
                    if (old == _new) {
                        return;
                    }
                    if (_new) {
                        element.modal('show');
                    } else {
                        element.modal('hide');
                    }
                });
            }
        }
    });