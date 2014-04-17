/*global jasmine,spyOn,describe,it,inject,module,beforeEach,angular,expect,window*/
describe("dropboxDatabase", function () {
    "use strict";
    beforeEach(function () {
        angular.module('test', ['dropboxDatabase', 'dropbox.mock']);
        module('test', function ($provide) {
            $provide.constant('$timeout', window.setTimeout.bind(window));
        });
    });
    describe('database', function () {
        beforeEach(function () {
            var self = this;
            inject(function (database) {
                self.database = database;
            });
        });
        it('#open', function (done) {
            this.database.open(done);
        });
    });
    describe('Table', function () {
        beforeEach(function () {
            var self = this;
            inject(function (Table, $timeout, database) {
                self.database = database;
                self.testTable = new Table('test', database, $timeout);
            });
        });
        it('#recordToHash', function () {
            var id, fields, record, hash;
            id = 'foo';
            fields = {foo: "bar", bar: "baz"};
            record = jasmine.createSpyObj('record', ['getId', 'getFields']);
            record.getId.and.returnValue(id);
            record.getFields.and.returnValue(fields);
            hash = this.testTable.recordToHash(record);
            expect(record.getId).toHaveBeenCalled();
            expect(record.getFields).toHaveBeenCalled();
            expect(hash.foo).toEqual(fields.foo);
            expect(hash.bar).toEqual(fields.bar);
            expect(hash.id).toEqual(id);
        });
        it('#hashToRecordFields', function () {
            var hash, record;
            hash = {id: 'foo', bar: "baz", baz: "biz"};
            record = this.testTable.hashToRecordFields(hash);
            expect(record.id).not.toBeDefined();
            expect(record.bar).toEqual(hash.bar);
        });
        it('#getTable', function (done) {
            this.testTable.getTable(done);
        });
        it('#setTable', function (done) {
            var t = {};
            this.testTable.setTable(t).getTable(function (err, table) {
                expect(table).toEqual(t);
                done();
            });
        });
        it('#insert', function (done) {
            this.testTable.insert({}, done);
        });
        it('#update', function (done) {
            /* mocking */
            var table, hash, record;
            table = jasmine.createSpyObj('table', ['get']);
            record = jasmine.createSpyObj('record', ['update', 'getFields', 'getId']);

            table.get.and.returnValue(record);
            record.getFields.and.returnValue({});
            record.getId.and.returnValue('foo');

            hash = {foo: 'bar', id: 'foo'};
            this.testTable.setTable(table);
            this.testTable.update(hash, function (err, hash) {
                expect(hash).toEqual(jasmine.objectContaining({
                    id: 'foo'
                }));
                expect(table.get).toHaveBeenCalledWith(hash.id);
                expect(record.update).toHaveBeenCalled();
                done(err);
            });
        });
        it('#find', function (done) {
            this.testTable.find({
                foo: 'bar'
            }, done);
        });
        it('#findAll', function (done) {
            this.testTable.findAll({}, done);
        });
        it('#delete', function (done) {
            this.testTable.delete({}, done);
        });
    });
    describe('tableFactory', function () {
        beforeEach(function () {
            var self = this;
            inject(function (tableFactory, Table) {
                self.Table = Table;
                self.tableFactory = tableFactory;
            });
        });
        it('#create', function () {
            expect(this.tableFactory.create('test') instanceof this.Table).toBe(true);
        });
    });
    describe('Feed', function () {
        beforeEach(function () {
            var self = this;
            inject(function (Feed, Table, $window) {
                self.record = {id: 'foo'};
                self.Feed = Feed;
            });
            it('#delete', function (done) {
                var record = {id: 'foo'};
                this.Feed.delete(record, done);
            });
        });
    });
    describe('Entry', function () {
        beforeEach(function () {
            inject((function () {
            }).bind(this));
        });
    });
});