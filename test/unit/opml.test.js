/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,jasmine,expect,describe,it,beforeEach,inject,module*/
"use strict";
describe('opml',function(){
    beforeEach(function(){
        var self=this;
        module('opml');
        inject(function  ($injector,opml) {
            self.$injector= $injector;
            self.opml=opml;
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

    /*
    describe('#import',function(){
    var blob=new window.ArrayBuffer([this.xmlString]);
    var file=new window.File(blob,"xmlString");
    });
    */
});
