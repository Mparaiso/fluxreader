module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            'bower_components/es5-shim/es5-shim.js',
            'https://www.google.com/jsapi',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
//            'bower_components/angular-resource/angular-resource.js',
//            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-mocks/angular-mocks.js',
//            'app/js/**/*.js',
            'javascript/googleFeed.js',
            'javascript/dropboxDatabase.js',
            'javascript/dropbox.js',
            'javascript/flowReader.js',
            'test/mocks/**/*.js',
            'test/unit/**/*.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },
        reporters: ['coverage'],
        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/*.js': ['coverage']
        }
    });
};
