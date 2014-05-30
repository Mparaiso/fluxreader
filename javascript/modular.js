/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*Copyright © 2014 mparaiso <mparaiso@online.fr>. All Rights Reserved.*/
/* a dependency injection container for javascript */
(function() {
    "use strict";
    var Modular, Injector, InjectorError,getFunctionArgs;
    /** extrat args from function */
    getFunctionArgs = function(func) {
        var length,comments,stripped,brackets,keep;
        length = func.length;
        if (length === 0) {
            return [];
        }
        comments = /(\/\*).*?\*\/ /gm;
        stripped = func.toString().replace(comments, "");
        brackets = /(?:\()(.*)?(?:\))/im;
        keep = stripped.match(brackets);
        return keep[1].split(/\s*,\s*/).map(function(service) {
            return service.trim();
        });
    };
    /** container */
    Modular = function(dependencies) {
        dependencies = dependencies || [];
        this.injector = new Injector();
        dependencies.forEach(function(dep) {
            this.injector.join(dep.injector);
        }, this);
    };

    Modular.prototype.service = function(name, array) {
        if (array instanceof Function) {
            var a = [];
            if (!array.inject || !(array.inject instanceof Array)) {
                array.inject = getFunctionArgs(array);
            }
            array = a.concat(array.inject).concat(array);
        }
        this.injector.register(name, array);
        return this;
    };
    Modular.prototype.value = function(name, value) {
        this.injector._registry.push({
            name: name,
            resolved: value
        });
        return this;
    };

    Modular.prototype.inject = function(service) {
        return this.injector.get(service);
    };
    /** injector */
    Injector = function() {
        this._registry = [];
    };
    Injector.prototype.get = function(name, parent) {
        var service,serviceDefinition,_constructor,_arguments;
        service = this._registry.filter(function(service) {
            return name === service.name;
        })[0];
        if (!service) {
            return;
        }
        if (service.resolved) {
            return service.resolved;
        }
        serviceDefinition = service.service.slice();
        _constructor = serviceDefinition.pop();
        _arguments = serviceDefinition.map(function(service) {
            var  s = this.get(service);
            if(s === undefined){
                throw ["Service",service,'not found in',name].join(' ');
            }
            return s ;
        }, this);

        service.resolved = new(Function.bind.apply(_constructor, [_constructor].concat(_arguments)))();
        return service.resolved;
    };
    Injector.prototype.register = function(name, array) {
        this._registry.push({
            name: name,
            service: array,
            resolved: false
        });
    };
    Injector.prototype.join = function(injector) {
        injector._registry.forEach(function(service) {
            this._registery.push(service);
        }, this);
    };
    this.modular = function() {
        return new Modular();
    };
    InjectorError=function(){ Error.apply(this,[].slice.call(arguments))};
    InjectorError.prototype=Object.create(Error.prototype);
    //this.modular.getFunctionArgs = getFunctionArgs;
}.call(this));

