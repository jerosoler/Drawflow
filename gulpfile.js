const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const replace = require('gulp-replace');
const { exec } = require('child_process');

gulp.task('style', () => {
  return gulp.src('dist/drawflow.min.css')
  .pipe(replace(/^(.*)$/, 'import {css} from "lit-element"; export const style = css`$1`;'))
  .pipe(concat('drawflow.style.js'))
  .pipe(gulp.dest('dist/'))
});

gulp.task('css', () => {
  return gulp.src('src/*.css')
  .pipe(minifyCSS())
  .pipe(concat('drawflow.min.css'))
  .pipe(gulp.dest('dist/'))
});

gulp.task('docs', (done) => {
  exec('npx jsdoc -c jsdoc.json', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error generating JSDoc: ${err}`);
      return done(err);
    }
    console.log(`JSDoc output: ${stdout}`);
    if (stderr) {
      console.error(`JSDoc errors: ${stderr}`);
    }
    done();
  });
});

gulp.task('default', gulp.series(
    'css', 
    'style',
    'docs'
  )
);
