const { src, dest, series, watch } = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const imgOpt = require('gulp-image');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del')
const browserSync = require('browser-sync').create();

const clean = () => {
   return del('dist')
}

const fontsTransfer = () => {
   return src([
      'src/fonts/**/*.woff',
      'src/fonts/**/*.woff2',
      'src/fonts/**/*.ttf',
   ])
      .pipe(dest('dist/fonts'))
      .pipe(browserSync.stream())
}

const htmlTransfer = () => {
   return src([
      'src/**/*.html',
   ])
      .pipe(dest('dist'))
      .pipe(browserSync.stream())
}

const jsTransfer = () => {
   return src([
      'src/js/**/*.js',
   ])
      .pipe(sourcemaps.init())
      .pipe(concat('main.js'))
      .pipe(sourcemaps.write())
      .pipe(dest('dist'))
      .pipe(browserSync.stream())
}

const cssTransfer = () => {
   return src([
      'src/css/**/*.css'
   ])
      .pipe(concat('styles.css'))
      .pipe(dest('dist'))
      .pipe(browserSync.stream())
}


const styles = () => {
   return src('dist/styles.css')
      .pipe(autoprefixer({
         cascade: false
      }))
      .pipe(cleanCSS({
         level: 2
      }))
      .pipe(dest('dist'))
}

const htmlMinify = () => {
   return src('src/**/*.html')
      .pipe(htmlMin({
         collapseWhitespace: true,
      }))
      .pipe(dest('dist'))
      .pipe(browserSync.stream())
}

const svgSprites = () => {
   return src('src/img/svg/**/*.svg')
      // .pipe(
      //    cheerio({
      //       run: function ($) {
      //          $('[fill]').removeAttr('fill');
      //          $('[stroke]').removeAttr('stroke');
      //          $('[style]').removeAttr('style');
      //       },
      //       parserOptions: {
      //          xmlMode: true
      //       },
      //    })
      // )
      .pipe(replace('&gt;', '>'))
      .pipe(svgSprite({
         mode: {
            stack: {
               sprite: '../sprite.svg'
            }
         }
      }))
      .pipe(dest('dist/img'))
      .pipe(browserSync.stream())
}

const scripts = () => {
   return src('src/js/**/*.js')
      .pipe(babel({
         presets: ['@babel/env']
      }))
      .pipe(concat('main.js'))
      .pipe(uglify({
         toplevel: true
      }).on('error', notify.onError()))
      .pipe(dest('dist'))
      .pipe(browserSync.stream())
}


const images = () => {
   return src([
      'src/img/**/*.jpg',
      'src/img/**/*.png',
      'src/img/*.svg',
      'src/img/**/*.jpeg',
   ])
      .pipe(imgOpt())
      .pipe(dest('dist/img'))
      .pipe(browserSync.stream())
}

const watchFiles = () => {
   browserSync.init({
      server: ({
         baseDir: 'dist'
      }),
      browser: "google chrome",
   })
}

watch('src/**/*.html', htmlTransfer)
watch('src/css/**/*.css', cssTransfer)
watch('src/js/**/*.js', jsTransfer)
watch('src/img/*', images)
watch('src/img/svg/*.svg', svgSprites)


exports.styles = styles
exports.htmlMinify = htmlMinify
exports.scripts = scripts
exports.clean = clean
exports.images = images

exports.dev = series(clean, htmlTransfer, cssTransfer, jsTransfer, fontsTransfer, images, svgSprites, styles, watchFiles)
exports.prod = series(clean, htmlMinify, styles, fontsTransfer, images, scripts, svgSprites)