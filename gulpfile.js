const gulp = require('gulp'),
  sass = require('gulp-sass'),
  minifycss = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  gzip = require('gulp-gzip'),
  del = require('del'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  tsify = require('tsify'),
  notifier = require('node-notifier'),
  nunjucks = require('gulp-nunjucks'),
  i18nAddMissingEntries = require('./i18nAddMissingEntries');

const handleError = err => {
  console.log(err.toString());
  notifier.notify({
    'title': 'Gulp worflow',
    'message': 'Typescript error'
  });
};

const scriptsDirectory = () =>
  browserify({
    basedir: '.',
    debug: true,
    entries: ['src/js/main.js'],
    cache: {},
    packageCache: {},
    standalone: 'goGoCarto'
  })
  .plugin(tsify)
  .transform('babelify', {
    presets: ['es2015'],
    extensions: ['.ts']
  })
  .bundle()
  .on('error', handleError)
  .pipe(source('directory.js'))
  .pipe(gulp.dest('build'));

const scriptsDeps = () =>
  gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/jquery-ui-dist/jquery-ui.min.js',
    'node_modules/moment/moment.js'
  ])
  .pipe(concat('deps.js'))
  .pipe(gulp.dest('build'));

const scriptsLibs = () =>
  gulp.src([
    'src/js/libs/**/!(leaflet-routing-machine)*.js',
    'src/js/libs/leaflet-routing-machine.js',
    'src/js/libs/bootstrap-datepicker.js' ,
    'src/js/libs/datepicker-locales/**/*.js' ,
    '!src/js/libs/materialize/unused/**/*.js'
  ])
  .pipe(concat('libs.js'))
  .pipe(gulp.dest('build'));

const templates = () =>
  gulp.src(['src/views/**/*.html.njk', '!src/views/nearest-mode/**/*.html.njk'])
    .pipe(nunjucks.precompile())
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('build'));

const styles = () =>
  gulp.src(['src/scss/**/*.scss'])
    .pipe(sass({ includePaths: ['node_modules']}).on('error', sass.logError))
    .pipe(gulp.dest('web/assets'));

const prodStyles = () =>
  gulp.src('dist/*!(*.min).css')
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist'));

const gzipStyles = () =>
  gulp.src('dist/*.min.css')
    .pipe(gzip())
    .pipe(gulp.dest('dist'));

const concatDirectory = () =>
  gulp.src([
    'build/deps.js',
    'build/libs.js',
    'build/templates.js',
    'build/directory.js'
  ])
    .pipe(concat('gogocarto.js'))
    .pipe(gulp.dest('dist'));

const concatCss = () =>
  gulp.src(['web/assets/gogocarto.css',
    'web/assets/images/styles.css'
  ])
    .pipe(concat('gogocarto.css'))
    .pipe(gulp.dest('dist'));

const fontAssets = () =>
  gulp.src(['web/assets/images/fonts/*'])
    .pipe(gulp.dest('dist/fonts/'));

const imageAssets = () =>
  gulp.src(['web/assets/images/*.png'])
    .pipe(gulp.dest('dist/images/'));

const prodJs = () =>
  gulp.src(['dist/*!(*.min).js'])
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));

const gzipJs = () =>
  gulp.src(['dist/*.min.js'])
    .pipe(gzip())
    .pipe(gulp.dest('dist'));

const cleanBuild = () => del(['build']);

const cleanDist = () => del(['dist']);

const watchStyles = () => gulp.watch(['src/scss/**/*.scss'], styles);
const watchDirectory = () => gulp.watch(['src/js/**/*.ts', 'src/locales/**/*.ts'], scriptsDirectory);
const watchDeps = () => gulp.watch('src/js/node_modules/**/*.js', scriptsDeps);
const watchLibs = () => gulp.watch('src/js/libs/**/*.js', scriptsLibs);
const watchTemplates = () => gulp.watch('src/views/**/*.njk', templates);

exports.watch = gulp.parallel(watchStyles, watchDirectory, watchDeps, watchLibs, watchTemplates);
exports.build = gulp.series(cleanBuild, gulp.parallel(styles, scriptsDirectory, scriptsDeps, scriptsLibs, templates));
exports.cleanDist = cleanDist;
exports.dist = gulp.series(cleanDist, gulp.parallel(
                  gulp.series(concatDirectory, prodJs, gzipJs),
                  gulp.series(concatCss, prodStyles, gzipStyles),
                  fontAssets, imageAssets));
exports.i18nAddMissingEntries = async () => i18nAddMissingEntries();