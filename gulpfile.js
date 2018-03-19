const
    gulp = require('gulp'),
    pump = require('pump'),
    merge = require('gulp-merge'),
    copy = require('gulp-copy'),
    copydeps = require('gulp-npm-copy-deps');

const client = function() {
    return pump([
        gulp.src('./client/dist/*.client.js'),
        copy('release/', { prefix: 2 })
    ]);
}

const core = function() {
    return pump([
        gulp.src('./core/dist/**/*'),
        copy('release/', { prefix: 2 })
    ]);
}

const core2 = function() {
    return pump([
        gulp.src('./core/index.js'),
        copy('release/', { prefix: 1 })
    ]);
}

const cssEditor = function() {
    return pump([
        gulp.src('./csseditor/dist/**/*'),
        copy('release/csseditor', { prefix: 2 })
    ]);
}

const deps = function() {
    return copydeps('./', './release');
}

const bindings = function() {
    return pump([
        gulp.src('./other/node_sass_bindings/**/*'),
        copy('release/node_modules/node-sass/vendor', { prefix: 2 })
    ]);
}

gulp.task('release', function () { return merge(client(), core(), core2(), cssEditor(), deps(), bindings())});
