/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,jasmine,inject,describe,beforeEach,it,expect*/
describe('googleFeed',function(){
    "use strict";
    beforeEach(function(){
        var self=this;
        this.feed=jasmine.createSpyObj('feed',['load','includeHistoricalEntries','setNumEntries']);
        this.google={
            load:jasmine.createSpy('load'),
            feeds:{
                findFeeds:jasmine.createSpy('findFeeds'),
                Feed:function(){
                    return self.feed;
                }
            }
        };
        angular.module('test',['googleFeed'],function(feedFinderProvider){
            feedFinderProvider.setGoogle(self.google);
            feedFinderProvider.setNumEntries(50);
        });
        module('test');
        inject(function($injector,$timeout) {
            self.$injector=$injector;
            self.$timeout=$timeout;
        });
    });
    describe('feedFinder',function(){
        beforeEach(function(){
            this.feedFinder=this.$injector.get('feedFinder');
        });
        it('#findFeedByUrl result error ',function(done){
            var err=true;
            this.feed.load.and.callFake(function(callback){
                if(err){
                    err=false;
                    return  callback({error:{}});
                }
                return callback({feed:{}});
            });
            this.google.feeds.findFeeds.and.callFake(function(url,callback){
                expect(url).toBe("site:foo");
                return callback({entries:[{url:"bar"}]});
            });
            this.feedFinder.findFeedByUrl("foo",done); 
        });
        it('#findFeedByUrl result ok',function(done){
            this.feed.load.and.callFake(function(callback){
                return callback({feed:{}});
            });
            this.feedFinder.findFeedByUrl("foo",done); 
        });
        it('#open',function(done){
            this.google.load.and.callFake(function(s,t,o){
                o.callback();
            });
            this.feedFinder.open(done);
        });
    });
});
