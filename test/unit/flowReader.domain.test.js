/*global describe,it,flowReader,beforeEach,expect*/
/*
describe('flowReader.model', function() {
	"use strict";
	beforeEach(function() {
		this.feed = new flowReader.model.Feed();
	});
	describe("Feed", function() {
		it('#constructor', function() {
			var entry = {}, url = 'http://google.com';
			this.feed.feedUrl(url);
			expect(this.feed.feedUrl()).toBe(url);
			this.feed.title();
			this.feed.link();
			this.feed.description();
			this.feed.author();
			this.feed.entries();
			this.feed.addEntry(entry);
			expect(this.feed.entries().length).toBe(1);
			this.feed.removeEntry(entry);
			expect(this.feed.entries().length).toBe(0);
		});
	});
	describe("Entry", function() {
		beforeEach(function() {
			this.entry = new flowReader.model.Entry();
		});
		it('#constructor', function() {
			var tag='buzz';
			this.entry.mediaGroup('foo');
			this.entry.title("bar");
			this.entry.link('baz');
			this.entry.addTag(tag);
			expect(this.entry.tags().length).toBe(1);
			this.entry.removeTag(tag);
			expect(this.entry.tags().length).toBe(0);
		});
	});
});
*/