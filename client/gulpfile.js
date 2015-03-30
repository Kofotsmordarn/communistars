'use strict';

var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    jade = require('gulp-jade'),
    sourcemaps = require('gulp-sourcemaps'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    //babel = require('gulp-babel'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify');

var watching = false;

function exitIfNotWatching(error) {
	if (watching) {
		gutil.log(error.message);
	}
	else {
		throw error;
	}
}

gulp.task('styles', function() {
    return gulp.src('./app/styl/game.styl')
        .pipe(plumber(exitIfNotWatching))
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./out/static/'))
        .pipe(livereload());
});

var browserifyOpts = {
    entries: './game.js',
    basedir: './app/scripts/',
    debug: true,
	 cache: {},
	    packageCache: {}
};
var bundler = watchify(browserify(browserifyOpts))
	.transform(babelify);

gulp.task('scripts', function() {
    var init = bundler.bundle()
		.on('error', function(err){
            gutil.log(err.message);
            this.emit('end');
		})
	    .pipe(plumber(exitIfNotWatching))
        .pipe(source('game.js'));

    if (!watching) {
        // If not watching (production build)
        init = init.pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('.'));
    }
    return init.pipe(gulp.dest('./out/static/'))
        .pipe(livereload());
});

gulp.task('static', function() {
    return gulp.src('./app/static/**')
        .pipe(gulp.dest('./out/static/'))
        .pipe(livereload());
});

gulp.task('templates', function() {
	return gulp.src('./app/templates/*.jade')
		.pipe(plumber(exitIfNotWatching))
		.pipe(jade())
		.pipe(gulp.dest('./out/'))
		.pipe(livereload());
});

gulp.task('watch', function() {
	watching = true;
	gulp.start(['styles', 'templates', 'scripts', 'static']);
	livereload.listen();
	gulp.watch('./app/styl/*', ['styles']);
	gulp.watch('./app/templates/*', ['templates']);
	gulp.watch('./app/scripts/*', ['scripts']);
	gulp.watch('./app/static/*', ['static']);
});

gulp.task('default', ['styles', 'templates', 'scripts', 'static'], function() {
    process.exit(0);
});
