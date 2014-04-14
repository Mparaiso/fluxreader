/*global describe,beforeEach,module,angular,expect*/
xdescribe('dropboxDatabase', function () {
    "use strict";
    describe('database', function () {
        beforeEach(function () {
            angular.module('test', ['dropbox.mock', 'dropboxDatabase']);
            module('test');
        });
        describe('#open', function () {
            it('should return a promise', function (done) {
                inject(function (database) {
                    database.open().then(done);
                });
            });
        });
    });
    xdescribe('tableFactory', function () {
        beforeEach(function () {
            angular.module('test', ['dropbox.mock', 'dropboxDatabase']);
            module('test');
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
    xdescribe('tableFactory.Table', function () {
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
        describe('#find', function () {
            it('should return a promise', function (done) {
                this.foodTable.find({}).then(done);
            });
        });
        describe('#findAll', function () {
            it('should return a promise', function (done) {
                this.foodTable.findAll({}).then(function (result) {
                    console.log('foo');
                    expect(result instanceof Array).toBe(true);
                    done();
                });
            });
        });
        describe('#delete', function () {
            it('should return a promise', function (done) {
                var record = {name: 'milk'};
                this.foodTable.insert(record).then(this.foodTable.delete.call(this.foodTable, record)).then(done);
            });
        });
    });
});
