/*global describe,beforeEach,module,angular,expect*/
(function () {
    "use strict";
    describe('dropboxDatabase', function () {
        describe('database', function () {
            beforeEach(function () {
                angular.module('test', ['dropbox.mock', 'dropboxDatabase']);
                module('test');
            });

            it('should exist', function () {
                inject(function (database) {
                    expect(database).not.toBeNull();
                    expect(database.openDefaultDatastore instanceof Function).toBe(true);
                });
            });
            it('should return a datastore', function (done) {
                inject(function (database) {
                    database.openDefaultDatastore().then(done);
                });
            });
        });
        describe('tableFactory', function () {
            beforeEach(function () {
                angular.module('test', ['dropbox.mock', 'dropboxDatabase']);
                module('test');
            });
            it('should exist', function () {
                inject(function (tableFactory) {
                    expect(tableFactory).not.toBeNull();
                });
            });
            describe('#create', function () {
                it('should return a table object', function () {
                    inject(function (tableFactory) {
                        var foods = tableFactory.create('foods');
                        expect(foods instanceof tableFactory.Table).toBe(true);
                    });
                });
            });
        });
        describe('tableFactory.Table', function () {
            beforeEach(function () {
                angular.module('test', ['dropboxDatabase', 'dropbox.mock', 'dropboxDatabase.mock']);
                module('test');
            });
            beforeEach(function () {
                var self = this;
                inject(function (tableFactory) {
                    self.foodTable = tableFactory.create('foods');
                });
            });
            describe('#getTable', function () {
                it('should return a promise', function (done) {
                    this.foodTable.getTable().then(done);
                });
            });
            describe('#insert', function () {
                it('should return a promise', function (done) {
                    var record = {name: 'milk'};
                    this.foodTable.insert(record).then(done);
                });
            });
            describe('#find',function(){
               it('should return a promise',function(done){
                   this.foodTable.find({}).then(done);
               });
            });
            describe('#findAll',function(){
                it('should return a promise',function(done){
                    this.foodTable.findAll({}).then(function(result){
                        expect(result instanceof Array).toBe(true);
                    });
                });
            });
            describe('#delete',function(){
                it('should return a promise',function(done){
                    var record = {name: 'milk'};
                    this.foodTable.insert(record).then(this.foodTable.delete.call(this.foodTable,record)).then(done);
                });
            });
        });
    });
}());