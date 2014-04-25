/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,todo:true,devel:true,regexp:true */
describe('myPagination',function(){
    beforeEach(function(){
        var self=this;
        module('myPagination');
        inject(function(Pagination){
            self.Pagination=Pagination;
        });
    });
    describe('Pagination',function(){
        it('expectations',function(){
            var array/*Array*/=[1,2,3];
            expect(this.Pagination).toBeDefined();
            expect(this.Pagination.slice(array).length).toBe(3);
            this.Pagination.skip(1);
            expect(this.Pagination.slice(array).length).toBe(2);
        });
    });
});

