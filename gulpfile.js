var gulp = require('gulp')
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var rename = require("gulp-rename");

var license = ['/*',
  ' * jquery-webglpanorama',
  ' * https://github.com/ulfbiallas/jquery-webglpanorama',
  ' *',
  ' * Copyright (c) 2014-2015 Ulf Biallas',
  ' * Licensed under the MIT license.',
  ' */',
  ''].join('\n');


gulp.task('minify', function() {
  return gulp.src('src/jquery-webglpanorama.js')
    .pipe(uglify())
    .pipe(header(license))
    .pipe(rename("jquery-webglpanorama.min.js"))
    .pipe(gulp.dest('src'));
});