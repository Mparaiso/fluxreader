/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global jQuery,spyOn,beforeEach,describe,it,expect,inject,angular,module*/

describe('ng',function(){
    "use strict";
    beforeEach(function(){
        angular.module('test',['ngSanitize']);
        module('test');
        var self=this;
        inject(function($injector,$rootScope,$timeout,$compile,$window,$document){
            self.$injector = $injector;
            self.$compile=$compile;
            self.$rootScope=$rootScope;
            self.$timeout=$timeout;
            self.$window=$window;
            self.$document=$document;
        });
    });
    //@note @angular test directives
    describe('thumbnail',function(){
        beforeEach(function(){
            this.elm = angular.element("<div thumbnail='content' ng-bind-html='content'></div>");
            this.$compile(this.elm)(this.$rootScope);
            this.$rootScope.content="";
            this.$rootScope.$apply();
            this.$rootScope.content =" <img src='foobar.png'/> <a href='http//foo.com'>foo</a> ";
            this.$rootScope.$apply();
            this.$timeout.flush();
        });
        it('a must have a target attribute equal to _blank',function(){
            var a,img;
            a =this.elm.find('a').first();
            img = this.elm.find('img');
            expect(a.attr('target')).toEqual('_blank'); 
            expect(img.parent().hasClass('thumbnail')).toBe(true);
        });
    });
    describe('media',function(){
        beforeEach(function(){
            this.src="http://example.com/audio.mp3";
            this.$rootScope.src=this.src;
            this.elm=angular.element("<media src='src'></media>");
            this.$compile(this.elm)(this.$rootScope);
            this.$rootScope.$apply();
        });
        [
            {url:undefined,el:"a"},
            {url:"",el:"a"},
            {url:"http://example.com/file.pdf",el:"a"},
            {url:"http://example.com/file.mpg",el:"video"},
            {url:"http://example.com/file.mp3",el:"audio"},
            {url:"http://example.com/file.png",el:"img"}
        ].forEach(function(test){
            it('should have an '+test.el+' element',function(){
                this.$rootScope.src=test.url;
                this.$rootScope.$apply();
                expect(this.elm.find(test.el).get(0)).toBeTruthy();
            });
        });
    });
    describe('mpDropTarget',function  () {
        /*@note @angular testing drag and drop events */
        beforeEach(function(){
            this.$rootScope.listener=angular.noop;
            spyOn(this.$rootScope,'listener');
            this.element=angular.element('<div mp-drop-target="listener"></div>');
            this.$compile(this.element)(this.$rootScope);
            this.$rootScope.$apply();
            this.$timeout.flush();
        });
        describe('Events',function(){
            it('dragenter',function  () {
                var dragenter= jQuery.Event("dragenter");
                this.element.trigger(dragenter);
            });
            it('dragleave',function  () {
                var dragleave= jQuery.Event("dragleave");
                this.element.trigger(dragleave);
            });
            it('dragover',function  () {
                var dragover= jQuery.Event("dragover");
                this.element.trigger(dragover);
            });
            it('drop',function  () {
                var drop= jQuery.Event("drop",{originalEvent:{dataTransfer:{files:[]}}});
                this.element.trigger(drop);
                expect(this.$rootScope.listener).toHaveBeenCalledWith(drop.originalEvent,drop.originalEvent.dataTransfer.files);
            });
        });
    });
});
