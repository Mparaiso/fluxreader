/*global jasmine,angular*/
angular.module('$window.mock', [])
.constant('$window', jasmine.createSpyObj('$window', ['prompt','location','confirm']));