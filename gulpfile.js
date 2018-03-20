const
    fs = require('fs'),
    gulp = require('gulp'),
    del = require('del'),
    pump = require('pump'),
    merge = require('gulp-merge'),
    copy = require('gulp-copy'),
    rename = require('gulp-rename'),
    copydeps = require('gulp-npm-copy-deps');

const corepkg = require('./core/package.json');
const clientpkg = require('./client/package.json');
const editorpkg = require('./csseditor/package.json');

const client = function() {
    return pump([
        gulp.src('./client/dist/*.client.js'),
        rename(`client.${clientpkg.version}.js`),
        gulp.dest('./release')
    ]);
}

const core = function() {
    return pump([
        gulp.src('./core/dist/modules/**/*'),
        copy('release/', { prefix: 2 })
    ]);
}

const core2 = function() {
    return pump([
        gulp.src('./core/dist/main.js'),
        rename(`core.${corepkg.version}.js`),
        gulp.dest('./release')
    ]);
}

const core3 = function() {
    return fs.writeFileSync('./release/index.js', `module.exports = require('./core.${corepkg.version}.js');`);
}

const sparkplug = function() {
    return pump([
        gulp.src('./core/dist/sparkplug.js'),
        gulp.dest('./release')
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

gulp.task('release', function () {
    del(['./release/**/*']).then(() => merge(client(), core(), core2(), core3(), sparkplug(), cssEditor(), deps(), bindings()));
});
