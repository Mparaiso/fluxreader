/*global angular,describe,beforeEach,jasmine,spyOn,module,inject,it,expect*/
/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */

describe('dropbox', function() {
    "use strict";
    describe('dropboxClient', function() {
        beforeEach(function() {
            var self = this;
            angular.module('test',['dropbox'],function($provide){
                $provide.value('client',jasmine.createSpyObj('client',['signOut','isAuthenticated','getAccountInfo','getDatastoreManager','writeFile','readFile','remove','authenticate']));
            });
            module('test');
            inject(function(dropboxClient,client) {
                self.dropboxClient = dropboxClient;
                self.client =client;
            });
        });
        it('#authenticate',function(){
            this.dropboxClient.authenticate();
            expect(this.client.authenticate).toHaveBeenCalled();
        });
        it('#signIn', function() {
            this.dropboxClient.signIn();
            expect(this.client.authenticate).toHaveBeenCalled();
        });
        it('#signOut', function() {
            this.dropboxClient.signOut();
        });
        it('#isAuthenticated', function() {
            this.dropboxClient.isAuthenticated();
        });
        it('#getDatastoreManager', function() {
            this.dropboxClient.getDatastoreManager();
        });
        it('#getAccountInfo', function() {
            this.dropboxClient.getAccountInfo();
        });
    });
});




