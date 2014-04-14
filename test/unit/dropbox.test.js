xdescribe('dropboxClient', function () {
    beforeEach(function () {
        module('dropbox');
    });
    it('should not be undefined', function () {
        inject(function (dropboxClient) {
            expect(dropboxClient).not.toBe(null);
            expect(dropboxClient).not.toBe(undefined);
        });
    });
    describe('#client', function () {
        it('should set the client', function () {
            inject(function (dropboxClient) {
                var client = {};
                dropboxClient.client=client;
                expect(dropboxClient.client).toBe(client);
            });

        });
    });
});