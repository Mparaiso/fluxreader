angular.module('$window.mock', [])
    .factory('$window', function () {
        return jasmine.createSpyObj('$window', ['prompt', 'confirm']);
    });