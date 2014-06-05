/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,_*/
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
"use strict";
var fluxreader=fluxreader||{};
/**
 * A database table with CRUD methods,implementing the
 * datamapper design patter
 * a record is a javascript object that has an id.
 * @constructor
 */
fluxreader.TableStub=function(tableName,d,timeout) {
    this._records=[];
    this._timeout=timeout;
    this._tableName=tableName;
};
fluxreader.TableStub.prototype = {
    insert: function (record, callback) {
        var _record=_.clone(record);
        _record.id=_.uniqueId(this._tableName);
        this._timeout(callback.bind(null,null,this._records.push(_record)&&_record));
    },
    /**
    * update a record
    * @param {object} record
    * @param {Function} callback
    */
    update: function (record, callback) {
        this._timeout(callback.bind(null,null,this._records.splice(_.findIndex(this._records,{id:record.id}),1,record)[0]&&record));
    },
    /**
    * get record by id
    * @param {String} id
    * @param {Function} callback
    */
    get: function (id, callback) {
        this.find({id:id},callback);
    },
    delete: function (record, callback) {
        this._timeout(callback.bind(null,null,this._records.splice(_.findIndex(this._records,{id:record.id}),1)[0]));   
    },
    findAll: function (query, callback) {
        if(_.isFunction(query)){
            callback=query;
            query=undefined;
        }
        if(typeof query ==='object' && Object.keys(query).length===0){
            query=undefined
        }
        this._timeout(callback.bind(null,null,_.filter(this._records,query)));    
    },
    find: function (query, callback) {
        if(_.isFunction(query)){
            callback=query;
            query=undefined;
        }
        if(typeof query ==='object' && Object.keys(query).length===0){
            query=undefined;
        }
        this._timeout(callback.bind(null,null,_.first(this._records,query)[0]));
    }
};


