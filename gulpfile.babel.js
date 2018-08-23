import gulp from 'gulp';
import pump from 'pump';
import del from 'del';
import copy from 'gulp-copy';
import rename from 'gulp-rename';
import inject from 'gulp-inject-string';
import copydeps from 'gulp-npm-copy-deps';
import file from 'gulp-file';
import editjson from 'gulp-json-editor';

import corepkg from './core/package';
import clientpkg from './client/package';

gulp.task('release-package', function () {
    return pump([
        gulp.src('package.json'),
        editjson(function (mainpkg) {
            delete mainpkg.main;
            delete mainpkg.devDependencies;
            delete mainpkg.scripts;
            return mainpkg;
        }),
        gulp.dest('release')
    ]);
});

gulp.task('client', function () {
    return pump([
        gulp.src('client/dist/*.client-release.js'),
        rename(`client.${clientpkg.version}.js`),
        gulp.dest('release')
    ]);
});

gulp.task('core', function () {
    return pump([
        gulp.src('core/dist/main.js'),
        inject.after("'use strict';\n", 'const PRODUCTION = true;\n'),
        rename(`core.${corepkg.version}.js`),
        gulp.dest('release')
    ]);
});

gulp.task('sparkplug', function () {
    return pump([
        gulp.src('core/dist/sparkplug.js'),
        gulp.dest('release')
    ]);
});

gulp.task('core-modules', function () {
    return pump([
        gulp.src('core/dist/modules/**/*'),
        copy('release', { prefix: 2 })
    ]);
});

gulp.task('index', function () {
    return pump([
        file('index.js', `module.exports = require('./core.${corepkg.version}.js');`, {src: true}),
        gulp.dest('release')
    ]);
});

gulp.task('css-editor', function () {
    return pump([
        gulp.src('csseditor/dist/csseditor-release.js'),
        rename('csseditor.js'),
        gulp.dest('release/csseditor')
    ]);
});

gulp.task('node-modules', function () {
    return copydeps('.', 'release');
});

gulp.task('node-sass-bindings', gulp.series(function () {
    return del(['release/node_modules/node-sass/vendor']);
}, function () {
    return pump([
        gulp.src('other/node_sass_bindings/**/*'),
        copy('release/node_modules/node-sass/vendor', { prefix: 2 })
    ]);
});

gulp.task('keytar-bindings', gulp.series(function () {
    return del(['release/node_modules/keytar/build']);
}, function () {
    return pump([
        gulp.src('other/keytar/**/*'),
        copy('release/node_modules/keytar/build/Release', {prefix: 2})
    ]);
}));

gulp.task('dependencies', gulp.series('node-modules', gulp.parallel('node-sass-bindings', 'keytar-bindings')));

gulp.task('build-release', gulp.parallel('release-package', 'client', 'core', 'sparkplug', 'core-modules', 'index', 'css-editor', 'dependencies'));

gulp.task('release', gulp.series(function () {
    return del(['release/**/*']);
}, 'build-release'));
