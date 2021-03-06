/*jslint node:true*/
module.exports = function(config) {
    "use strict";
    config.set({

        basePath: '../',

        files: [
            'bower_components/es5-shim/es5-shim.js',
            "bower_components/js-md5/js/md5.js",
            'bower_components/async/lib/async.js',
            'bower_components/jquery/dist/jquery.min.js',
            'https://www.google.com/jsapi',
            'https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'javascript/*.js',
            'test/mocks/*.js',
            'test/unit/*.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage',
            'karma-coveralls'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },
        reporters:['progress'],
        preprocessors:{
            "javascript/*.js":['coverage']
        },
        coverageReporter:{
            type:'text',
            dir:'coverage/'
        }
    });
};
