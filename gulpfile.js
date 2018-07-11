'use strict';

let gulp = require('gulp');
let babel = require("gulp-babel");
let del = require('del');

// Paths for project js files
let path_theme_js = "./themes/generic/public/js/**.js";
let path_theme_es5 = "./themes/generic/public/es5/";
let path_public_js = "./public/js/**.js";
let path_public_es5 = "./public/es5/";

// Converts theme js files to EMAC5 for compatibility
gulp.task("babel_theme", ['clean'], function () {
    return gulp.src([path_theme_js, "!js/**/*.min.js"])
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest(path_theme_es5));
});

// Converts theme js files to EMAC5 for compatibility
gulp.task("babel_public", ['clean'], function () {
    return gulp.src([path_public_js])
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest(path_public_es5));
});

//Limpia la carpeta cada vez que se corre
gulp.task('clean', function() {
    return del.sync([path_public_es5, path_theme_es5]);
});
gulp.task('default', ["clean", "babel_theme", "babel_public"]);