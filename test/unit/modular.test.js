/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global describe,beforeEach,it,expect,modular*/
/* test/unit/modular.test.js*/
describe("modular", function() {
    "use strict";
    beforeEach(function() {
        this.modular = modular()
        .service('service1', function() {
            this.foo = "foo"
        }).service('service2', ['service1',
            function(s) {
                this.foo = s.foo;
                this.bar = "bar";
            }
        ]).service('service3', function( /*bar*/ service1, /*biz*/ service2 /*foo*/ ) {
            this.foo = service1.foo;
            this.bar = service2.bar;
        });
    });
    describe('#value', function() {
        beforeEach(function() {
            this.modular.value('foo', 'foo');
        });
        it('foo', function() {
            console.log(this.modular.inject('foo'));
            expect(this.modular.inject('foo')).toEqual('foo');
        });
    });
    describe('#service', function() {
        beforeEach(function() {
            this.service3 = this.modular.injector.get('service3');
        })

        it('#inject', function() {
            expect(this.service3).toBe(this.modular.inject('service3'));
        })
        it('#get', function() {
            expect(this.service3.foo).toBe("foo");
            expect(this.service3.bar).toBe("bar");
        })
    });
    /*
    describe('#factory',function(){
        beforeEach(function(){
            this.modular.factory('factory',function(){

            });
        });
        it('should return different instances',function(){
            var i1=this.modular.inject('factory');
            var i2=this.modular.inject('factory');
            expect(i1===i2).not.toBe(true);
        });
    });
    */
})

