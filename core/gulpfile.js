const
    gulp = require('gulp'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch');

const task_babel = function () {
    return pump([
        gulp.src('src/**/*js'),
        plumber(),
        babel(),
        gulp.dest('dist')
    ]);
}

const watch_babel = function () {
    return pump([
        watch('src/**/*js'),
        plumber(),
        babel(),
        gulp.dest('dist')
    ]);
}

gulp.task('build', task_babel);
gulp.task('watch', watch_babel);