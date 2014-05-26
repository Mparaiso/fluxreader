/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global importScripts */
"use strict";
importScripts('https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js');
importScripts("javascript/backend");
importScripts('javascript/modular');
var module = modular();
module.value("Table",fluxreader.Table)
.service('File',fluxreader.File)
.service('Database',fluxreader.Database);

