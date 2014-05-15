/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global describe,it,beforeEach,expect,module,inject*/
/* test/unit/promisifier.test.js */
describe('Promisifier',function(){
    "use strict";
    beforeEach(function(){
        var self=this;
        module('ng');
        inject(function($rootScope,$timeout,Promisifier){
            self.$timeout=$timeout;
            self.Promisifier=Promisifier;
            self.$rootScope=$rootScope;
        });
    });
    describe('#promisify',function(){
        beforeEach(function(){
            var self=this,func;
            func = function(callback){
                func.result = func.result || {status:"ok"};
                self.$timeout(function(){
                    if(func.error){
                        return callback(new Error(func.error));
                    }
                    return callback(null,func.result);
                });
            };
            this.func=func;
        });
        it('resolves',function(done){
            this.func.result="foo";
            this.Promisifier.promisify(this.func,this)().then(function(result){
                return expect(result).toEqual("foo");
            }).then(done);
            this.$timeout.flush();
            this.$rootScope.$apply();
        });
        it('rejects',function(done){
            var self=this;
            this.func.error = "this is an error";
            this.Promisifier.promisify(this.func,this)().catch(function(err){
                return expect(err instanceof Error).toBe(true);
            }).then(done);
            this.$timeout.flush();
            this.$rootScope.$apply();
        });
    });
});

