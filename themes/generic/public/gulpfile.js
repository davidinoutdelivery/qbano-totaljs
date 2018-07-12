/*------------------------------------*\
    $DEPENDECIAS
\*------------------------------------*/
var gulp        = require('gulp'),
    stylus      = require('gulp-stylus'),
    nib         = require('nib'),
    plumber     = require('gulp-plumber'),
    concat      = require('gulp-concat'),
    watch       = require('gulp-watch'),
    uglify      = require('gulp-uglify'),
    notify      = require("gulp-notify"),
    jshint      = require('gulp-jshint'),
    jeet        = require('jeet'),
    path        = require('path'),
    rupture     = require('rupture'),
    // imagemin    = require('gulp-imagemin'),
    // pngquant    = require('imagemin-pngquant'),
    debug       = require('gulp-debug');





/*------------------------------------*\
    $LINEA ERROR
\*------------------------------------*/
var displayError = function(error) {
    var errorString = '[' + error.plugin + ']';
    if(error.fileName)
        errorString += ' in ' + error.fileName;
    if(error.lineNumber)
        errorString += ' on line ' + error.lineNumber;
    console.error(errorString);
}




/*------------------------------------*\
    $RUTAS
\*------------------------------------*/
var app = {
    stylus : [
        "stylus/*.styl",
        "stylus/core/*.styl"
    ],
    js     : [
        'js/app.js'
    ],
    // imgs   : 'imagesDev/**/*.*',
    error  : 'images/error.png',
    nice  : 'images/nice.png'
}

var dist = {
    css  : 'css/',
    js   : 'js/'
    // imgs : 'images/'
};





/*----------------------------------------------------------------------------------------*\
    $TAREAS
\*----------------------------------------------------------------------------------------*/
/*------------------------------------*\
    $STYLUS
\*------------------------------------*/
// gulp.task('stylus', function () {
//   return gulp.src(src_stylus)
//     .pipe(plumber({
//       errorHandler : linea
//     }))
//     .pipe(stylus({
//       compress: true,
//       use: [nib(), rupture(), jeet()]
//     }))
//     .pipe(gulp.dest(dest_css))
//     .pipe(notify("Compilo Stylus"));
// });
gulp.task('stylus', function () {
    return gulp.src('stylus/app.styl')
        .pipe(stylus({
            compress: true,
            use: [nib(), rupture(), jeet()]
        }))
        .on('error', function(err){displayError(err); })
        .on('error', notify.onError({
            icon: path.join(__dirname, app.error),
            title: 'Oops ocurrio un error en CSS!',
            message: 'Error css: <%= error.message %>'
        }))
        .pipe(concat('app.css'))
        .pipe(gulp.dest(dist.css))
        .pipe(notify({
            icon: path.join(__dirname, app.nice),
            title: 'Compilado correctamente!',
            message: 'Compilo archivo: <%= file.relative %>'
        }));
});



/*------------------------------------*\
    $JAVASCRIPT
\*------------------------------------*/
// gulp.task('vendor',function(){
//   return gulp.src(app.libs)
//     .pipe(jshint())
//     // .pipe(jshint.reporter('default'))
//     .pipe(uglify())
//     .on('error', function(err){displayError(err); })
//     .on('error', notify.onError({
//       icon: path.join(__dirname, app.error),
//       title: 'Oops ocurrio un error en JS!',
//       message: 'Error js: <%= error.message %>'
//     }))
//     .pipe(concat('vendor.min.js'))
//     .pipe(debug({title: 'unicorn:'}))
//     .pipe(gulp.dest(dist.libs))
//     .pipe(notify("Compilo archivo: <%= file.relative %>"));
// });

gulp.task('appjs',function(){
    return gulp.src(app.js)
        .pipe(jshint())
        .pipe(uglify({
            // mangle: false
        }))
        .on('error', function(err){displayError(err); })
        .on('error', notify.onError({
            icon: path.join(__dirname, app.error),
            title: 'Oops ocurrio un error en JS!',
            message: 'Error js: <%= error.message %>'
        }))
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(dist.js))
        .pipe(notify("Compilo archivo: <%= file.relative %>"));

});




/*------------------------------------*\
    $IMAGENES
\*------------------------------------*/
// gulp.task('imgs', function () {
//   return gulp.src([app.imgs])
//     .pipe(imagemin({
//         progressive: false,
//         optimizationLevel : 6,
//         svgoPlugins: [{removeViewBox: false}],
//         use: [pngquant()]
//     }))
//     .pipe(gulp.dest(dist.imgs))
//     .pipe(notify("minifico imagen: <%= file.relative %>"));
// });






/*---------------------------------------------------------------------------*\
    $AUTO COMPILAR
\*---------------------------------------------------------------------------*/

/*------------------------------------*\
    $wATCH & SERVER
\*------------------------------------*/
gulp.task('watch', function() {
    gulp.watch(app.stylus, ['stylus']);
});



/*------------------------------------*\
    $JAVASCRIPTS
\*------------------------------------*/
gulp.task('js',['appjs']);



/*------------------------------------*\
    $POR DEFECTO
\*------------------------------------*/
gulp.task('default',['watch','stylus','js']);