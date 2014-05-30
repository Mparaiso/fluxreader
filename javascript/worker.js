/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global importScripts,modular,fluxreader,q */
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
"use strict";

importScripts('https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js');
importScripts('../bower_components/q/q.js');
importScripts('promisifier.js');
importScripts("backend.js");
importScripts('modular.js');
var module = modular();
module.value("Table",fluxreader.Table)
.value('apiKey','jze8pzfye506das')
.service('client',fluxreader.Client)
.service('dropboxClient',fluxreader.DropboxClient)
.value('$timeout',setTimeout)
.service('$q',Q)
.service('Promisifier',fluxreader.Promisifier)
.service('File',fluxreader.File)
.service('Entry',fluxreader.Entry)
.service('Feed',fluxreader.Feed)
.service('tableFactory',fluxreader.TableFactory)
.service('database',fluxreader.Database)
.service('feedFinder',fluxreader.FeedFinder);

module.inject('Entry');

