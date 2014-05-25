/*jslint white:true*/
/*global jasmine,spyOn,describe,it,inject,module,beforeEach,angular,expect,window*/
describe("dropboxDatabase", function () {
    "use strict";
    beforeEach(function () {
        var self = this;
        angular.module('test', [ 'dropboxDatabase', 'dropbox.mock', 'googleFeed.mock'],function(dropboxClientProvider){
        });
        module('test');
        inject(function ($timeout,$injector,$rootScope) {
            self.$timeout = $timeout;
            self.$injector=$injector;
            self.$rootScope=$rootScope;
        });
        this.entries=[
            {title:'foo something ',description:'foo',favorite:true},
            {title:'foo something else ',description:'some description'},
            {title:'bar',description:'bar',favorite:true}
        ];
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
            this.$timeout.flush();
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
        it('#hashToRecordFields', function () {
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
        it('#getTable', function (done) {
            this.testTable.getTable(done);
            this.$timeout.flush();
        });
        it('#setTable', function (done) {
            var t = {};
            this.testTable.setTable(t).getTable(function (err, table) {
                expect(table).toEqual(t);
                done();
            });
            this.$timeout.flush();
        });
        it('#insert', function (done) {
            this.testTable.insert({}, done);
            this.$timeout.flush();
        });
        it('#update', function (done) {
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
            this.testTable.update(hash, function (err, hash) {
                expect(hash).toEqual(jasmine.objectContaining({
                    id: 'foo'
                }));
                expect(table.get).toHaveBeenCalledWith(hash.id);
                expect(record.update).toHaveBeenCalled();
                done(err);
            });
            this.$timeout.flush();
        });
        it('#find', function (done) {
            this.testTable.find({
                foo: 'bar'
            }, done);
            this.$timeout.flush();
        });
        it('#findAll', function (done) {
            this.testTable.findAll({}, done);
            this.$timeout.flush();
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
            inject(function (Feed, Table, $window, $timeout) {
                self.record = {
                    id: 'foo'
                };
                self.Feed = Feed;
            });
            it('#delete', function (done) {
                var record = {
                    id: 'foo'
                };
                this.Feed.delete(record, done);
            });
        });
    });
    describe('Entry', function () {
        beforeEach(function () {
            var self = this;
            this.table = jasmine.createSpyObj('table', ['update']);
            inject(function (Entry) {
                self.Entry = Entry;
            });
        });
        it('#setTable', function () {
            var table = {};
            this.Entry.setTable(table);
            expect(this.Entry.getTable()).toEqual(table);

        });
        describe('#toggleFavorite', function () {
            it('should toggle favorite field', function (done) {
                var table,entry = {
                    id: 'foo',
                    favorite: false
                };
                table = this.Entry.getTable();
                spyOn(table, 'update').and.callFake(function (record, callback) {
                    callback(undefined, record);
                });

                this.Entry.toggleFavorite(entry, function (err, entry) {
                    expect(err).not.toBeDefined();
                    expect(entry.favorite).toBe(true);
                    done();
                });
            });

        });
        describe('#markAsRead', function () {
            it('should mark an entry as read', function (done) {
                var self=this,entry = {
                    id: 'foo',
                    read: false
                };
                this.Entry.setTable(this.table);
                this.table.update.and.callFake(function (entry, callback) {
                    callback(undefined, entry);
                });
                this.Entry.markAsRead(entry, function (err, entry) {
                    expect(self.table.update).toHaveBeenCalled();
                    done(err);
                });
            });
        });
        describe('#extractMediaGroups', function () {
            beforeEach(function  () {
                this.entry={
                    mediaGroups: [
                        {
                        contents: [
                            {filesize: 100, url: 'foo'},
                            {filesize: 100, url: 'bar'},
                        ]
                    },
                    {
                        contents: [
                            {filesize: 200, url: 'baz'},
                            {filesize: 200, url: 'biz'}
                        ]
                    }
                    ]
                };
            });
            it('should return the right array', function () {
                expect(this.Entry.extractMediaGroups(this.entry)).toEqual(['foo', 'bar', 'baz', 'biz']);
            });
        });
        describe('#findFavorites',function  () {
            it('should get favorites',function(done){
                var self=this;
                this.Entry.findFavorites(done);
                this.$timeout.flush();
            });
        });
        describe('#findUnread',function(){
            it('should get undread',function(done){
                this.Entry.findUnread(done);
                this.$timeout.flush();
            });
        });
    });
    describe("EntryCache", function () {
        beforeEach(function () {
            var self = this;
            inject(function (EntryCache, FeedCache,$q, $rootScope,Entry,File,$timeout,client) {
                self.FeedCache = FeedCache;
                self.EntryCache = EntryCache;
                self.Entry = Entry;
                self.$timeout=$timeout;
                self.$rootScope=$rootScope;
                self.$q=$q;
            });
            spyOn(this.Entry,'findAll').and.callFake(function(q,cb){
                return cb(null,self.entries);
            });
        });
        describe('#delete', function () {
            it('should remove entry in entries', function (done) {
                var self=this,entry = {id: 'foo'};
                spyOn(this.Entry, 'delete').and.callFake(function(entry,callback){
                    callback();
                });
                this.EntryCache.entries = [entry];
                this.EntryCache.delete(entry).then(function(){
                    return expect(self.EntryCache.entries.length).toEqual(0);
                }).then(done);
                expect(this.Entry.delete).toHaveBeenCalled();
                this.$timeout.flush();
            });
        });
        describe("#load", function () {
            it('should return a promise', function (done) {
                var self=this;
                spyOn(this.FeedCache, 'load').and.callThrough();
                this.EntryCache.load().then(function   (entries) {
                    expect(entries.length).toEqual(self.entries.length);
                    expect(self.EntryCache.entries).toBe(entries);
                }).then(done);
                expect(this.FeedCache.load).toHaveBeenCalled();
                this.$timeout.flush();
            });
        });
        describe('#getCategories',function(){
            beforeEach(function(){
                this.EntryCache.entries=[
                    {categories:['foo']},
                    {categories:['bar']}
                ];
            });
            it('should return an array of length 2',function(){
                expect(this.EntryCache.getCategories().length).toBe(2);
            });
        });
        describe('#search',function(){
            it('should filter results by foo',function(done){
                var query="foo";
                this.EntryCache.search(query).then(function(res){
                    expect(res.every(function(entry){          
                        return JSON.stringify(entry).match(/foo/);
                    })).toBe(true);
                }).then(done);
                this.$timeout.flush();
            });
            it('should filter results by bar',function(done){
                var query="bar";
                this.EntryCache.search(query).then(function(res){
                    expect(res.every(function(entry){          
                        return JSON.stringify(entry).match(/bar/);
                    })).toBe(true);
                }).then(done);
                this.$timeout.flush();
            });
        });
    });
    describe('File',function(){
        beforeEach(function(){
            this.File=this.$injector.get('File');
            this.client = this.$injector.get('client');
        });
        it('constructor',function(){
            expect(this.File).toBeDefined();
        });
        it('#write',function(){
            var content,path;
            path="path";
            content="content";
            this.File.write(path,content);
            expect(this.client.writeFile).toHaveBeenCalled();
        });
        it('#read',function(){
            var content,path;
            path="path";
            content="content";
            this.File.read(path);
            expect(this.client.readFile).toHaveBeenCalled();
        });
        it('#remove',function(){
            var path="path";
            this.File.remove(path);
            expect(this.client.remove).toHaveBeenCalled();
        });
    });
});
