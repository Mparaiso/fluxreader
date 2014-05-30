/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,fluxreader*/
/* Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.  */
"use strict";
var fluxreader=fluxreader||{};
var angular=angular || undefined;
fluxreader.Promisifier = function($q){
    /**
    * takes a function that requires a callback(err,res) as last argument
    * and returns a function that returns a promise
    * @exemple
    *   promisify(Resource.fetch,Resource);
    *   promisify(Resource,"fetch");
    * @param {Function|Object} func  function or context
    * @param {Object|string} context context or function name
    * @param {*} arguments
    */
    this.promisify=function(func,context){
        if(typeof context ==='string'){
            var c=func;
            func = c[context];
            context = c;
        }
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
};
/* because of possible use in webworkers , if angular,register the module */
if( angular  ){
    angular.module('ng')
    .service('Promisifier',fluxreader.Promisifier);
}

