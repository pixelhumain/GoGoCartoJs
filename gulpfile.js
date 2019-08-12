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
    nunjucks = require('gulp-nunjucks'),
    addMissingEntries = require('./addMissingEntries');

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
    .pipe(gulp.dest("build"));
});

gulp.task('scriptsLibs', function() {
  return gulp.src(['src/js/libs/**/!(leaflet-routing-machine)*.js',
                  'src/js/libs/leaflet-routing-machine.js' ,
                  '!src/js/libs/materialize/unused/**/*.js',
                  '!src/js/libs/nunjucks-slim.js',
                  '!src/js/libs/commonmark.js'
                   ])
    .pipe(concat('libs.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('templates', function() {
  return gulp.src(['src/views/**/*.html.njk', '!src/views/nearest-mode/**/*.html.njk'])
    .pipe(nunjucks.precompile())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build'))
});

gulp.task('sass', function () {
  return gulp.src(['src/scss/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('web/assets'));
});

gulp.task('prod_styles', function() {
  return gulp.src('dist/*!(*.min).css')
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('dist'));
    //.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('gzip_styles', ['prod_styles'], function() {
  return gulp.src('dist/*.min.css')
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
    //.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('concat_directory', function() {
  return gulp.src(['build/libs.js',
                   'build/templates.js',
                   'build/directory.js'
                   ])
    .pipe(concat('gogocarto.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('concat_css', function() {
  return gulp.src(['web/assets/gogocarto.css',
                   'web/assets/images/styles.css'
                   ])
    .pipe(concat('gogocarto.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist_assets', ['concat_css'], function() {
    gulp.src(['web/assets/images/fonts/*'])
    .pipe(gulp.dest('dist/fonts/'));
  return gulp.src(['web/assets/images/*.png'])
    .pipe(gulp.dest('dist/images/'));
});


gulp.task('prod_js', ['concat_directory'], function() {
  return gulp.src(['dist/*!(*.min).js'])
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('gzip_js', ['prod_js'],  function() {
  return gulp.src(['dist/*.min.js'])
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});


gulp.task('watch', function()
{
  gulp.watch(['src/scss/**/*.scss'], ['sass']);

  gulp.watch(['src/js/**/*.ts', 'src/locales/**/*.ts'], ['scriptsDirectory']);

  gulp.watch('src/js/libs/**/*.js', ['scriptsLibs']);

  gulp.watch('src/views/**/*.njk', ['templates']);

});

gulp.task('cleanBuild', function(cb) {
    del(['build'], cb);
});

gulp.task('cleanDist', function(cb) {
    del(['dist'], cb);
});

gulp.task('build', function() {
    gulp.start('cleanBuild','sass', 'scriptsLibs','scriptsDirectory', 'templates');
});

gulp.task('dist', function() {
    gulp.start('concat_directory','dist_assets');
});

gulp.task('production', function() {
    gulp.start('gzip_styles', 'gzip_js');
});

gulp.task('addMissingEntries', function ()
{
  addMissingEntries();
});