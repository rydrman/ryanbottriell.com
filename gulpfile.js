/*jshint node:true*/
var gulp = require('gulp'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    karma = require('karma'),
    jasmine = require('gulp-jasmine');

gulp.task('lint', function() {
  return gulp.src('src/**/*.js')
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(jshint())
    .pipe(jshint.reporter())
    .pipe(jshint.reporter('fail'));
});

gulp.task('build', [ 'lint' ], function() {

});

gulp.task('test-server', [ 'lint' ], function() {
  return gulp.src( 'test/server/**/*.js' )
    .pipe( jasmine({verbose: true}) );
});

gulp.task('test-client', [ 'test-server' ], function(done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() { done(); }).start();
});

gulp.task('test', [ 'test-client', 'test-server' ]);

