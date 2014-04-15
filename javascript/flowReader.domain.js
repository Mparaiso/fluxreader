/*jslint stupid:true*/
(function(global, undefined) {
	"use strict";
	var flowReader = {
		service: {}
	};
	flowReader.service.Feed = (function() {
		/**
		 * Feed service
		 * @param {google.feed} feedAPI     api used to subscribe feed
		 * @param {Table} feedDataProvider  feed persistance object
		 * @param {Table} entryDataProvider entry persistance object
		 */
		function Feed(feedAPI, feedDataProvider) {
			this._feedAPI = feedAPI;
			this._feedDataProvider = feedDataProvider;
		}
		/**
		 * [subscribe description]
		 * @param  {string}   url      feed url
		 * @param  {Function} callback callback as callback(err,result)
		 * @return {Promise}
		 */
		Feed.prototype.subscribe = function(url, callback) {
			var that = this;
			return this._feedAPI
				.open()
				.then(this._feedAPI.findFeedByUrl.bind(this._feedAPI, url))
				.then(function(feed) {
					return callback(null, that._feedDataProvider.insert(feed));
				});
		};
		return Feed;
	}());
	global.flowReader = flowReader;
}(this));