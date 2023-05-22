import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import csso from 'postcss-csso';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import { stacksvg } from 'gulp-stacksvg';
import rename from 'gulp-rename';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import { deleteAsync } from 'del';
import svgstore from 'gulp-svgstore';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

// Scripts

const script = () => {
  return gulp.src('/source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'));
}

// Images

const optimizeImages = () => {
  return gulp.src('source/img/hero-block/*.{jpg,png,webp}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,webp}')
  .pipe(gulp.dest('build/img'));
}

// createWebp

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png,webp}')
  .pipe(squoosh(
    {
      webp: {},
    }
  ))
  .pipe(gulp.dest('build/img'));
}

// SVG

const svg = () => {
  return gulp.src('source/img/**/*.svg', '!source/img/stack-icon/*.svg')
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}

const createStack = () => {
  return gulp.src('source/img/icon-stack/*.svg')
  .pipe(svgo())
  .pipe(stacksvg({ output: `stack` }))
  .pipe(gulp.dest('build/img'));
}

const sprite = () => {
  return gulp.src('source/img/sprite-icon/*.svg')
    .pipe(svgo())
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy

const copy = (done) => {
  return gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

// del

const clean = () => {
  return deleteAsync('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    createStack,
    sprite,
    createWebp
  ),
);

// default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    createStack,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
