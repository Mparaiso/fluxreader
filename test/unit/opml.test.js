/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,jasmine,expect,describe,it,beforeEach,inject,module*/
"use strict";
describe('opml',function(){
    beforeEach(function(){
        var self=this;
        module('opml');
        inject(function  ($timeout,$injector,opml,$window,$rootScope) {
            self.$injector= $injector;
            self.opml=opml;
            self.$window=$window;
            self.$rootScope=$rootScope;
            self.$timeout=$timeout;
        });
        this.feedList=[{title:"foo",type:"rss",feedUrl:"bar",link:"baz"}];
        this.xmlString='<opml version="1.0"><body><outline title="foo" text="foo" type="rss" xmlUrl="bar" htmlUrl="baz"/></body></opml>';
    });
    describe('#export',function(){
        it('should return a XMLDOM',function(){
            var res=this.opml.export(this.feedList);
            expect(res).toEqual(this.xmlString);
        });
    });   

    describe('#import',function(){
        beforeEach(function(){
            var self=this;
            this.$window.FileReader=function(){};
            this.$window.FileReader.prototype.readAsText=function(value){
                self.$timeout(function(){
                    this.onloadend({result:value});
                }.bind(this));
            };
            spyOn(this.$window.FileReader.prototype,'readAsText').and.callThrough();
        });
        it('should transform a File into a list of feedUrls ',function(done){
            var self=this;
            this.file =this.xmlString;
            this.opml.import(this.file).then(function(urlList){
                expect(urlList.length).toBe(1);
                expect(urlList[0]).toEqual("bar");
                expect(self.$window.FileReader.prototype.readAsText).toHaveBeenCalled();
            }).then(done);
            this.$rootScope.$apply();
            this.$timeout.flush();
        });
    });
});
