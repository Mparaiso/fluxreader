/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global describe,beforeEach,angular,module,inject,it,expect*/
describe('myPagination',function(){
    "use strict";
    beforeEach(function(){
        var self=this;
        module('myPagination');
        inject(function(Pagination,$injector,$rootScope,$timeout,$compile){
            self.Pagination=Pagination;
            self.$injector=$injector;
            self.$compile=$compile;
            self.$rootScope=$rootScope;
        });
    });
    //@note @angular testing directives
    describe('paginator directive',function(){
        beforeEach(function(){
            this.elm=angular.element('<div paginator></div>');
            this.$compile(this.elm)(this.$rootScope);
            this.$rootScope.$digest();
        });
        it('element should have a class paginator',function(){
            expect(this.elm.hasClass('paginator')).toBe(true); 
        });
    });
    describe('Pagination',function(){
        beforeEach(function(){
            this.array=[1,2,3,4];
        });
        it('page',function(){
            expect(this.Pagination.page()).toBe(1);
        });
        it('limit',function(){
            this.Pagination.limit(2);
            expect(this.Pagination.slice(this.array).length).toBe(2);
        });       
        it('skip',function(){
            this.Pagination.limit(2);
            this.Pagination.skip(1);
            expect(this.Pagination.slice(this.array).length).toBe(2);
        });    
        it('reset',function(){
            this.Pagination.limit(2);
            this.Pagination.skip(2);
            expect(this.Pagination.slice(this.array).length).toBe(0);
            this.Pagination.reset();
            expect(this.Pagination.slice(this.array).length).toBe(2);
            expect(this.Pagination.page()).toBe(1);
        });       

        it('hasPrevious',function(){
            expect(this.Pagination.hasPrevious()).toBe(false);
        });        
        it('hasNext',function(){
            expect(this.Pagination.hasNext(this.array)).toBe(true);
        });         
        it('next',function(){
            this.Pagination.limit(2);
            this.Pagination.next();
            expect(this.Pagination.slice(this.array).length).toBe(2);
            expect(this.Pagination.page()).toBe(2);
        });       
        it('previous',function(){
            this.Pagination.previous();
            expect(this.Pagination.page()).toBe(1);
            this.Pagination.skip(2);
            this.Pagination.previous();
            expect(this.Pagination.page()).toBe(2);
        });              
    });
});
