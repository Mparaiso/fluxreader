/*jslint stupid:true*/
(function(self, undefined) {
	"use strict";
	// /**
	//  * create "properties" on  a constructor
	//  * @example
	//  * 		constructor.prototype.prop();<br>
	//  *   	constructor.prototype.prop('value');
	//  * @param  {Array<string>} propertyList
	//  * @param  {Function} targetConstuctor
	//  * @return {void}
	//  */
	// var createProperties = function(propertyList, targetConstuctor) {
	// 	propertyList.forEach(function(property) {
	// 		this.prototype[property] = (function(property) {
	// 			var _private = "_".concat(property);
	// 			return function(value) {
	// 				if (value === undefined) {
	// 					return this[_private];
	// 				}
	// 				this[_private] = value;
	// 				return this;
	// 			};
	// 		}(property));
	// 	}, targetConstuctor);
	// };
	// /**
	//  * @namespace
	//  */
	// self.flowReader = {
	// 	model: {},
	// 	service: {}
	// };

	// /**
	//  * Models
	//  */

	// self.flowReader.model.Feed = (function() {
	// 	function Feed() {
	// 		this._entries = [];
	// 	}
	// 	Feed.prototype.addEntry = function(entry) {
	// 		this._entries.push(entry);
	// 	};
	// 	Feed.prototype.removeEntry = function(entry) {
	// 		var index = this._entries.indexOf(entry);
	// 		return this._entries.splice(index, 1);
	// 	};
	// 	createProperties(['feedUrl', 'title', 'link', 'description', 'author', 'entries'], Feed);
	// 	return Feed;
	// }());
	// self.flowReader.model.Entry = (function() {
	// 	function Entry() {
	// 		this._tags = [];
	// 	}
	// 	Entry.prototype.addTag = function(tag) {
	// 		this._tags.push.apply(this._tags, [].slice.call(arguments));
	// 	};
	// 	Entry.prototype.removeTag = function(tag) {
	// 		var index = this._tags.indexOf(tag);
	// 		return this._tags.splice(index, 1);
	// 	};
	// 	createProperties(['tags', 'mediaGroup', 'title', 'link', 'content', 'contentSnippet', 'publishedDate', 'categories'], Entry);
	// 	return Entry;
	// }());

	/**
	 * Services
	 */

	self.flowReader.service.Feed = (function() {
		/**
		 * Feed service
		 * @param {google.feed} feedAPI     api used to subscribe feed
		 * @param {Table} feedDataProvider  feed persistance object
		 * @param {Table} entryDataProvider entry persistance object
		 */
		function Feed(feedAPI, feedDataProvider, entryDataProvider) {
			this._feedAPI = feedAPI;
			this._feedDataProvider = feedDataProvider;
			this._entryDataProvider = entryDataProvider;
		}
		/**
		 * [subscribe description]
		 * @param  {string}   url      feed url
		 * @param  {Function} callback callback as callback(err,result)
		 * @return {Promise}
		 */
		Feed.prototype.subscribe = function(url, callback) {
			var that=this;
			return this._feedAPI
				.open()
				.then(this._feedAPI.findFeedByUrl.bind(this._feedAPI, url))
				.then(function(feed){
					if(feed){
						var _feed = that._feedDataProvider.insert({
							author:feed.author,
							description:feed.description,
							feedUrl:feed.feedUrl,
							link:feed.link,
							title:feed.title,
							type:feed.type,
							entries:feed.entries
						});
						
					}
				});
		};

		return Feed;
	}());

}(this));