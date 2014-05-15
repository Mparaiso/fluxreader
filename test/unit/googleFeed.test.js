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
        it('#findFeedByUrl',function(done){
            this.feed.load.and.callFake(done);
            this.feedFinder.findFeedByUrl("foo"); 
        });
        it('#open',function(done){
            this.google.load.and.callFake(function(s,t,o){
                o.callback();
            });
            this.feedFinder.open(done);
        });
    });
});
