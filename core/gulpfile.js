const
    gulp = require('gulp'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch');

const task_build = function () {
    return pump([
        gulp.src('src/**/*js'),
        plumber(),
        babel(),
        gulp.dest('dist')
    ]);
}

const task_watch = function () {
    return pump([
        watch('src/**/*js'),
        plumber(),
        babel(),
        gulp.dest('dist')
    ]);
}

gulp.task('build', task_build);
gulp.task('watch', task_watch);
