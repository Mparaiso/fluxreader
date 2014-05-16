/*global angular*/
/**
* @copyright 2014 mparaiso <mparaiso@online.fr>
* @license GPL
*/
(function(){
    "use strict";
    angular.module('myPagination', [])
    .directive('paginator',function(){
        return {
            restrict:"EA",/* restrict to element */
            link:function($scope,element){
                element.addClass('paginator');
            }
        };
    })
    .service('Pagination',function(){
        var _skip=0,_limit=Infinity;
        this.skip=function(skip){
            _skip= +skip;
        };
        this.limit=function(limit){
            _limit= limit;
        };
        this.reset=function(){
            _limit= Infinity;
            _skip=0;
        };
        this.slice=function(array){
            array=array||[];
            return array.slice(_skip,_limit);
        };
        this.hasPrevious = function(array){
            return _skip > 0 ;
        };
        this.hasNext = function(array){
            return _skip+_limit > array.length;
        };
        this.next = function(){
            _skip++;
        };
        this.previous = function(){
            _skip--;
        };
    });
}());

