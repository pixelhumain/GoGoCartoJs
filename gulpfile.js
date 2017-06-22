var gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    gzip = require('gulp-gzip'),
    del = require('del'),
    browserify = require("browserify"),
    source = require('vinyl-source-stream'),
    tsify = require("tsify"),
    notifier = require('node-notifier'),
    nunjucks = require('gulp-nunjucks');

function handleError(err) 
{
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
  return gulp.src(['src/js/libs/**/!(leaflet-routing-machine)*.js', 
                  'src/js/libs/leaflet-routing-machine.js' ,
                  '!src/js/libs/materialize/unused/**/*.js',
                   ])
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('templates', function() {
  return gulp.src(['src/views/**/*.html.njk', '!src/views/nearest-mode/**/*.html.njk'])
    .pipe(nunjucks.precompile())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('dist'))
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
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
    //.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('concat_directory', function() {
  return gulp.src(['dist/directory.js', 
                   'dist/templates.js',
                   'dist/libs.js'
                   ])
    .pipe(concat('gogocarto.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('prod_js', ['concat_directory'], function() {
  return gulp.src(['dist/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('gzip_js', ['prod_js'],  function() {
  return gulp.src(['dist/*.js'])
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});


gulp.task('watch', function() 
{
  gulp.watch(['src/scss/**/*.scss'], ['sass']);

  gulp.watch(['src/js/**/*.ts'], ['scriptsDirectory']);
  
  gulp.watch('src/js/libs/**/*.js', ['scriptsLibs']);

  gulp.watch('src/views/**/*.njk', ['templates']);

});

gulp.task('clean', function(cb) {
    del(['dist'], cb);
});

gulp.task('build', function() {
    gulp.start('clean','sass', 'scriptsLibs','scriptsDirectory', 'templates');
});

gulp.task('production', function() {
    gulp.start('gzip_styles', 'gzip_js');
});

