/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular*/
/* Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
(function(){
    "use strict";
    angular.module('pagination', [])
    .filter('paginator',function(Pagination){
        return function(list){
            return Pagination.slice(list);
        }
    }).service('Pagination',function(){
        var _skip=0,_limit=Infinity;
        this.skip=function(skip){
            if(skip){
                _skip= skip;
            }else{
                return _skip;
            }
        };
        this.limit=function(limit){
            if (limit) {
                _limit= limit;
            }else{
                return _limit;
            }
        };
        this.reset=function(){
            _skip=0;
        };
        this.slice=function(array){
            array=array||[];
            return array.slice(_skip*_limit,(_skip*_limit)+_limit);
        };
        this.hasPrevious = function(array){
            return _skip > 0 ;
        };
        this.hasNext = function(array){
            array=array||[];
            return (_skip+1)*_limit < array.length;
        };
        this.next = function(){
            _skip++;
        };
        this.previous = function(){
            _skip=_skip-1<0?0:_skip-1;
        };
        this.page = function(){
            return _skip+1;
        };
    });
}());

