/*jslint vars:true,eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular*/
"use strict";
angular.module('opml',[])
.service('opml',function($q,$window,$document){
    /** 
     * read file as string
     * @private
     */
    this._readFile=function(file){
        var deferred,reader;
        deferred=$q.defer();
        reader = new $window.FileReader();
        reader.readAsText(file);
        reader.onloadend=function(e){
            deferred.resolve(reader.result);
        };
        reader.onerror=deferred.reject.bind(deferred);
        return deferred.promise;
    };

    /**
     * @param {string} an xml string
     * @return {Array} a list of urls
     */
    this._parse=function(xmlString){
        var deferred,parser,doc,result;
        parser = new $window.DOMParser();
        doc = parser.parseFromString(xmlString, "text/xml");
        result =  [].slice.call(doc.querySelectorAll('outline[xmlUrl]'))
        .map(function  (node) {
            return node.getAttribute('xmlUrl');
        });
        return result;
    };

    /**
     * return a list of urls from a file 
     * @param {File} file
     * @return {Promise}
     */
    this.import=function(file) {
        var self=this;
        return this._readFile(file).then(function(xmlString){
            return self._parse(xmlString)
        ;});
    };
    /**
     * returns a xml string from a list of Feeds
     * @param {Array<Feed>} feedList
     * @return {string} 
     */
    this.export=function(feedList){
        return this._serialize(this._toXML(feedList));
    };
    /** 
     * xml to string 
     * @private
     */
    this._serialize=function(xml){
        var serializer=new $window.XMLSerializer();
        return serializer.serializeToString(xml);
    };
    /** feedlist to xml 
     * @private
     */
    this._toXML=function(feedList){
        // create dom
        var xml=$window.document.implementation.createDocument(null,null);
        xml.xmlStandalone=true;
        xml.xmlEncoding="UTF-8";
        var opml=xml.createElement('opml');
        opml.setAttribute('version','1.0');
        var body = xml.createElement('body');
        var outline = xml.createElement('outline');
        feedList.map(function(feed){
            var outlineClone = outline.cloneNode();
            outlineClone.setAttribute('title',feed.title);
            outlineClone.setAttribute('text',feed.title);
            outlineClone.setAttribute('type',feed.type);
            outlineClone.setAttribute('xmlUrl',feed.feedUrl);
            outlineClone.setAttribute('htmlUrl',feed.link);
            return outlineClone;
        }).forEach(body.appendChild.bind(body));
        opml.appendChild(body);
        xml.appendChild(opml);
        return xml;
    };
});
