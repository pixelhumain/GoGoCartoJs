var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    ts = require("gulp-typescript"),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    gzip = require('gulp-gzip');
    //livereload = require('gulp-livereload'),
    del = require('del'),
    gutil = require('gulp-util'),
    babel = require('gulp-babel');

var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require('gulp-uglify');
const notifier = require('node-notifier');

function handleError(err) {
  console.log(err.toString());
  notifier.notify({
  'title': 'Gulp worflow',
  'message': 'Typescript error'
  });
  this.emit('end');
}


gulp.task("scriptsDirectory", function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/js/gogocarto.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .on('error', handleError)
    .pipe(source('directory.js'))
    .pipe(gulp.dest("dist"));
});


gulp.task('scriptsLibs', function() {
  return gulp.src(['src/js/libs/**/*.js', 
                  '!src/js/libs/materialize/unused/**/*.js'
                   ])
    .pipe(concat('libs.js'))
    // .pipe(rename({suffix: '.min'}))
    // .pipe(uglify())
    .pipe(gulp.dest('dist'));
    //.pipe(livereload());
    //.pipe(notify({ message: 'Scripts Libs task complete' }));
});


gulp.task('sass', function () {
  return gulp.src(['src/scss/**/*.scss'])
    .pipe(sass().on('error', sass.logError))    
    .pipe(gulp.dest('web/assets/css'));
});

gulp.task('prod_styles', function() {
  return gulp.src('web/assets/css/**/*.css')
    //.pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gzip())
    .pipe(gulp.dest('web/assets/css'));
    //.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('gzip_styles', ['prod_styles'], function() {
  return gulp.src('dist/**/*.css')
    //.pipe(rename({suffix: '.min'}))
    //.pipe(minifycss())
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
    //.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('concat_directory', function() {
  return gulp.src(['dist/directory.js', 
                   'dist/directory-templates.js',
                   'dist/libs.js',
                   'web/vendors/leaflet-routing-machine.js',
                   ])
    .pipe(concat('gogocarto.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('prod_js', ['concat_directory'], function() {
  return gulp.src(['dist/*.js'])
    .pipe(uglify())
    //.pipe(sourcemaps.init({loadMaps: true}))
    //.pipe(uglify().on('error', gulpUtil.log)) // notice the error event here
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

gulp.task('gzip_js', ['prod_js'],  function() {
  return gulp.src(['dist/*.js'])
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});


gulp.task('watch', function() {

  //livereload.listen();
  // Watch .scss files
  gulp.watch(['src/scss/**/*.scss'], 
              ['sass']);

  // Watch .js files
  gulp.watch(['src/js/**/*.ts'], 
              ['scriptsDirectory']);
  
  gulp.watch('src/js/libs/**/*.js', ['scriptsLibs']);

});

gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

gulp.task('build', function() {
    gulp.start('clean','sass', 'scriptsLibs','scriptsDirectory');
});

gulp.task('production', function() {
    gulp.start('gzip_styles', 'gzip_js');
});

