import gulp from 'gulp';
import pump from 'pump';
import babel from 'gulp-babel';
import watch from 'gulp-watch';

gulp.task('build', function () {
    return pump([
        gulp.src('src/**/*.js'),
        babel(),
        gulp.dest('dist')
    ]);
});

gulp.task('watch', function () {
    return pump([
        watch('src/**/*.js'),
        babel(),
        gulp.dest('dist')
    ]);
});
