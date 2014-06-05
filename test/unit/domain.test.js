/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global fluxreader,angular,describe,beforeEach,it,module,inject,expect,jasmine*/
"use strict";
describe('fluxreader',function(){
    beforeEach(function(){
        var self=this;
        angular.module('test',['dropboxDatabase','dropbox'])
        .constant('Table',fluxreader.TableStub);
        module('test');
        inject(function($injector,FolderRepository,$timeout,$rootScope){
            self.$injector=$injector;
            self.FolderRepository=FolderRepository;
            self.$timeout=$timeout;
            self.$rootScope=$rootScope;
        });
    });
    describe('FolderRepository',function(){
        describe('#insert',function(){
            it('',function  (done) {
                var folder={title:"foo"};
                this.FolderRepository.insert(folder)
                .then(function(folder){
                    expect(folder.id).toBeDefined();
                })
                .then(done);
                this.$rootScope.$apply();
                this.$timeout.flush();
            }); 
        });
        describe('#find',function(){
            beforeEach(function(done){
                var self=this;
                this.folder={title:"bar"};
                this.FolderRepository.insert(this.folder).then(function(folder){
                    self.inserted=folder;
                    done();
                });
                this.$timeout.flush();
            });
            it('',function(done){
                var self=this;
                this.FolderRepository.find({id:this.inserted.id})
                .then(function(folder){
                    expect(folder.description).toEqual(self.inserted.description);
                    done();
                });
            });
        });
        describe('#update',function(){
            beforeEach(function(done){
                var self=this;
                this.folder={title:"bar"};
                this.FolderRepository.insert(this.folder).then(function(folder){
                    self.inserted=folder;
                    done();
                });
                this.$timeout.flush();
            });
            it('',function(done){
                var self=this;
                this.inserted.open=true;
                this.FolderRepository.update(this.inserted)
                .then(function(folder){
                    expect(folder.open).toEqual(self.inserted.open);
                    done();
                });
            });
        });
    });
});
