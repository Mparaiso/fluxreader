/*global describe,beforeEach,jasmine,module,inject,it,expect*/
describe('dropbox', function() {
    "use strict";
    describe('dropboxClient', function() {
        beforeEach(function() {
            var self = this;
            module('dropbox', function($provide) {
                $provide.factory('client', function() {
                    return jasmine.createSpyObj(
                        'client', ['authenticate',
                       'signOut', 'getDatastoreManager', 'isAuthenticated',
                        'getAccountInfo']
                    );
                });
            });
            inject(function(dropboxClient, client) {
                self.dropboxClient = dropboxClient;
                self.client = client;
            });
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