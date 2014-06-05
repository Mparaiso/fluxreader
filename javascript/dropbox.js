/*global angular,Dropbox*/
/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/**
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";
var fluxreader=fluxreader||{};
/**
* angular dropBox module
* MANAGE DROPBOX API
* @dependencies dropbox-datastores-1.0-latest.js
*/
angular.module('dropbox', []) 
.constant('DROPBOX_APIKEY', 'jze8pzfye506das' /* override with your api key */ )
.service('client', ['DROPBOX_APIKEY',fluxreader.Client])
.service('dropboxClient',fluxreader.DropboxClient );                 
