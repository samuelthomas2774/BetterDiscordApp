const
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    gulp = require('gulp'),
    del = require('del'),
    pump = require('pump'),
    merge = require('gulp-merge'),
    copy = require('gulp-copy'),
    rename = require('gulp-rename'),
    inject = require('gulp-inject-string'),
    copydeps = require('gulp-npm-copy-deps');

const mainpkg = require('./package.json');
const corepkg = require('./core/package.json');
const clientpkg = require('./client/package.json');
const editorpkg = require('./csseditor/package.json');

const releasepkg = function() {
    delete mainpkg.main;
    delete mainpkg.devDependencies;
    delete mainpkg.scripts;
    mkdirp.sync('./release');
    return fs.writeFileSync('./release/package.json', JSON.stringify(mainpkg, null, 2));
};

const client = function() {
    return pump([
        gulp.src('./client/dist/*.client-release.js'),
        rename(`client.${clientpkg.version}.js`),
        gulp.dest('./release')
    ]);
};

const core = function() {
    return pump([
        gulp.src('./core/dist/main.js'),
        inject.after("'use strict';\n", 'const PRODUCTION = true;\n'),
        rename(`core.${corepkg.version}.js`),
        gulp.dest('./release')
    ]);
};

const sparkplug = function() {
    return pump([
        gulp.src('./core/dist/sparkplug.js'),
        gulp.dest('./release')
    ]);
};

const core_modules = function() {
    return pump([
        gulp.src('./core/dist/modules/**/*'),
        copy('release/', { prefix: 2 })
    ]);
};

const index = function() {
    return fs.writeFileSync('./release/index.js', `module.exports = require('./core.${corepkg.version}.js');`);
};

const cssEditor = function() {
    return pump([
        gulp.src('./csseditor/dist/csseditor-release.js'),
        rename('csseditor.js'),
        copy('release/csseditor', { prefix: 2 })
    ]);
};

const deps = function() {
    return copydeps('./', './release');
};

const node_sass_bindings = function() {
    return pump([
        gulp.src('./other/node_sass_bindings/**/*'),
        copy('release/node_modules/node-sass/vendor', { prefix: 2 })
    ]);
};

gulp.task('release', function () {
    return del(['./release/**/*']).then(() => merge(releasepkg(), client(), core(), sparkplug(), core_modules(), index(), cssEditor(), deps(), node_sass_bindings()));
});
