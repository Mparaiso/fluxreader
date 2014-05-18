/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
"use strict";
/**
 * @type Array
 */
var arr=[];

/**
 * @param {string} bar
 * @param {number} baz
 */
function Foo(bar,baz){
    this.bar=bar;
    this.baz=baz;
}
Foo.prototype.biz=function(){return "biz";};

var foo = new Foo("foo",1);
foo.bar();
foo.bar();

/**
 * @type {model.Entry}
 */
var entry=new model.Entry();



