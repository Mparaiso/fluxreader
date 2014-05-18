/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,describe,it,beforeEach,module,inject,expect*/
"use strict";
describe('index',function(){
    beforeEach(function(){
        var self=this;
        module('index');
        inject(function($injector,$rootScope,$controller){
            self.$injector = $injector;
            self.$controller=$controller;
            self.$rootScope=$rootScope;
            self.$scope=$rootScope.$new();
        });
    });
    describe('MainCtrl',function(){
        beforeEach(function(){
            this.MainCtrl=this.$controller('MainCtrl',{$scope:this.$scope});
        });
        it('#isAuthenticated',function(){
            expect(this.$scope.isAuthenticated()).toBe(false);
        });
    });
});

