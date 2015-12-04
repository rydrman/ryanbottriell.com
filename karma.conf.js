/*jshint node: true*/
module.exports = function(config) {
  config.set({
    // list of files / patterns to load in the browser
    files: [
      'test/client/**/*.js'
    ],

    frameworks: [ 'jasmine' ],

    // list of files to exclude
    exclude: [
    ],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress', 'junit', 'teamcity'
    // CLI --reporters progress
    reporters: [ 'progress', 'junit' ],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: 'log/test-results.xml'
    },

    // web server port
    port: 9876,

    // cli runner port
    runnerPort: 9100,

    // enable colors
    colors: true,

    // level of logging
    // LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS, IE
    browsers: [
      'Chrome'
    ],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 5000,

    // Auto run tests on start (when browsers are captured) and exit
    singleRun: true,

    // report which specs are slower than 500ms
    reportSlowerThan: 500,

    // compile for browserify scripts
    preprocessors: {
      'test/client/**/*.js': 'browserify'
    }
  });
};
