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
        this.array=[1,2,3,4];
    });
    //@note @angular testing directives
    describe('paginator',function(){
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
        it('expectations',function(){
            expect(this.Pagination).toBeDefined();
            expect(this.Pagination.slice(this.array).length).toBe(4);
            this.Pagination.skip(1);
            expect(this.Pagination.slice(this.array).length).toBe(3);
        });
        it('limit',function(){
            this.Pagination.limit(2);
        });    
        it('reset',function(){
            this.Pagination.reset();
        });       

        it('slice',function(){
            this.Pagination.slice(this.array);
        });     
        it('hasPrevious',function(){
            this.Pagination.hasPrevious();
        });        
        it('hasNext',function(){
            this.Pagination.hasNext(this.array);
        });         
        it('next',function(){
            this.Pagination.next();
        });       
        it('previous',function(){
            this.Pagination.previous();
        });              
    });
});
