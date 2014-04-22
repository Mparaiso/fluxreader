/*global jasmine,spyOn,describe,it,inject,module,beforeEach,angular,expect,window*/
describe("dropboxDatabase", function() {
    "use strict";
    beforeEach(function() {
        var self = this;
        angular.module('test', ['$window.mock', 'dropboxDatabase', 'dropbox.mock', 'googleFeed.mock']);
        module('test');
        inject(function($timeout) {
            self.$timeout = $timeout;
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
            this.$timeout.flush();
        });
    });
    describe('Table', function() {
        beforeEach(function() {
            var self = this;
            inject(function(Table, $timeout, database) {
                self.database = database;
                self.testTable = new Table('test', database, $timeout);
            });
        });
        it('#recordToHash', function() {
            var id, fields, record, hash;
            id = 'foo';
            fields = {
                foo: "bar",
                bar: "baz"
            };
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
        it('#hashToRecordFields', function() {
            var hash, record;
            hash = {
                id: 'foo',
                bar: "baz",
                baz: "biz"
            };
            record = this.testTable.hashToRecordFields(hash);
            expect(record.id).not.toBeDefined();
            expect(record.bar).toEqual(hash.bar);
        });
        it('#getTable', function(done) {
            this.testTable.getTable(done);
            this.$timeout.flush();
        });
        it('#setTable', function(done) {
            var t = {};
            this.testTable.setTable(t).getTable(function(err, table) {
                expect(table).toEqual(t);
                done();
            });
            this.$timeout.flush();
        });
        it('#insert', function(done) {
            this.testTable.insert({}, done);
            this.$timeout.flush();
        });
        it('#update', function(done) {
            /* mocking */
            var table, hash, record;
            table = jasmine.createSpyObj('table', ['get']);
            record = jasmine.createSpyObj('record', ['update', 'getFields', 'getId']);

            table.get.and.returnValue(record);
            record.getFields.and.returnValue({});
            record.getId.and.returnValue('foo');

            hash = {
                foo: 'bar',
                id: 'foo'
            };
            this.testTable.setTable(table);
            this.testTable.update(hash, function(err, hash) {
                expect(hash).toEqual(jasmine.objectContaining({
                    id: 'foo'
                }));
                expect(table.get).toHaveBeenCalledWith(hash.id);
                expect(record.update).toHaveBeenCalled();
                done(err);
            });
            this.$timeout.flush();
        });
        it('#find', function(done) {
            this.testTable.find({
                foo: 'bar'
            }, done);
            this.$timeout.flush();
        });
        it('#findAll', function(done) {
            this.testTable.findAll({}, done);
            this.$timeout.flush();
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
    describe('Feed', function() {
        beforeEach(function() {
            var self = this;
            inject(function(Feed, Table, $window,$timeout) {
                self.record = {
                    id: 'foo'
                };
                self.Feed = Feed;
            });
            it('#delete', function(done) {
                var record = {
                    id: 'foo'
                };
                this.Feed.delete(record, done);
            });
        });
    });
    describe('Entry', function() {
        beforeEach(function() {
            var self = this;
            this.table = jasmine.createSpyObj('table', ['update']);
            inject(function(Entry) {
                self.Entry = Entry;
            });
        });
        it('#setTable', function() {
            var table = {};
            this.Entry.setTable(table);
            expect(this.Entry.getTable()).toEqual(table);

        });
        describe('#toggleFavorite', function() {
            it('should toggle favorite field', function(done) {
                var entry = {
                    id: 'foo',
                    favorite: false
                };
                var table = this.Entry.getTable();
                spyOn(table, 'update').and.callFake(function(record, callback) {
                    callback(undefined, record);
                });

                this.Entry.toggleFavorite(entry, function(err, entry) {
                    expect(err).not.toBeDefined();
                    expect(entry.favorite).toBe(true);
                    done();
                });
            });

        });
        describe('#markAsRead', function() {
            it('should mark an entry as read', function(done) {
                var entry = {
                    id: 'foo',
                    read: false
                };
                this.Entry.setTable(this.table);
                this.table.update.and.callFake(function(entry, callback) {
                    callback(undefined, entry);
                });
                this.Entry.markAsRead(entry, (function(err, entry) {
                    expect(this.table.update).toHaveBeenCalled();
                    done(err);
                }).bind(this));
            });
        });
    });
    describe("EntryCache", function() {
        beforeEach(function() {
            var self = this;
            inject(function(EntryCache, FeedCache,Entry) {
                self.FeedCache = FeedCache;
                self.EntryCache = EntryCache;
                self.Entry=Entry;
            });
        });
        describe('#delete',function(){
            it('should return a promise',function(done){
                var entry={id:'foo'};
                spyOn(this.Entry,'delete').and.callThrough();
                this.EntryCache.entries=[entry];
                this.EntryCache.delete({}).then((function(){
                    expect(this.EntryCache.entries.length).toBe(0);
                    done();
                }).bind(this));
                expect(this.Entry.delete).toHaveBeenCalled();
                this.$timeout.flush();
            });
        });
        describe("#load", function() {
            it('should return a promise', function(done) {
                spyOn(this.FeedCache,'load').and.callThrough();
                this.EntryCache.load().then(done);
                expect(this.FeedCache.load).toHaveBeenCalled();
                this.$timeout.flush();
            });
        });
    });
});
