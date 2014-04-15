/*global describe,it,inject,module,beforeEach,angular,expect,window*/
describe("dropboxDatabase", function() {
    "use strict";
    beforeEach(function() {
        angular.module('test', ['dropboxDatabase', 'dropbox.mock']);
        module('test', function($provide) {
            $provide.constant('$timeout', window.setTimeout);
        });
    });
    describe('database', function() {
        beforeEach(function() {
            var self = this;
            inject(function(database) {
                self.database = database;
            });
        });
        it('#open', function(done) {
            this.database.open(done);
        });
    });
    describe('Table', function() {
        beforeEach(function() {
            var self = this;
            inject(function(Table, $timeout, database) {
                self.testTable = new Table('test', database, $timeout);
            });
        });
        it('#getTable', function(done) {
            this.testTable.getTable(done);
        });
        it('#insert', function(done) {
            this.testTable.insert({}, done);
        });
        it('#find', function(done) {
            this.testTable.find({
                foo: 'bar'
            }, done);
        });
        it('#findAll', function(done) {
            this.testTable.findAll({}, done);
        });
        it('#delete', function(done) {
            this.testTable.delete({}, done);
        });
    });
    describe('tableFactory', function() {
        beforeEach(function() {
            var self = this;
            inject(function(tableFactory, Table) {
                self.Table = Table;
                self.tableFactory = tableFactory;
            });
        });
        it('#create', function() {
            expect(this.tableFactory.create('test') instanceof this.Table).toBe(true);
        });
    });
});