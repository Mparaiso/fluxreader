/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular*/
/* Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.  */
angular.module('ng')
.service('Promisifier',function($q){
    "use strict";
    /**
    * takes a function that requires a callback(err,res) as last argument
    * and returns a function that returns a promise
    * @param {Function} func
    * @param {Object} context
    * @param {*} arguments
    */
    this.promisify=function(func,context){
        return function(){
            var callback,deferred;
            deferred = $q.defer();
            callback= function(err,result){
                if(err){
                    deferred.reject(err);
                }else{
                    deferred.resolve(result);
                }
            };
            func.apply(context,[].slice.call(arguments).concat([callback]));
            return deferred.promise;
        };
    };
});
