import gulp from 'gulp';
import pump from 'pump';
import babel from 'gulp-babel';

gulp.task('build', function () {
    return pump([
        gulp.src('src/**/*.js'),
        babel(),
        gulp.dest('dist')
    ]);
});

gulp.task('watch', function () {
    return gulp.watch('src/**/*.js', gulp.series('build'));
});
