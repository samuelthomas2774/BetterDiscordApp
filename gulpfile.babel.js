import gulp from 'gulp';
import pump from 'pump';
import rename from 'gulp-rename';

/**
 * Core
 */

import babel from 'gulp-babel';
import inject from 'gulp-inject-string';

import corepkg from './core/package';

gulp.task('build-core', function () {
    return pump([
        gulp.src('core/src/**/*.js'),
        babel(),
        gulp.dest('dist')
    ]);
});

gulp.task('watch-core', gulp.series('build-core', function () {
    return gulp.watch('core/src/**/*.js', gulp.series('build-core'));
}));

gulp.task('release-core-main', function () {
    return pump([
        gulp.src('core/src/main.js'),
        babel(),
        inject.after("'use strict';\n", 'const PRODUCTION = true;\n'),
        rename(`core.${corepkg.version}.js`),
        gulp.dest('release')
    ]);
});

gulp.task('release-sparkplug', function () {
    return pump([
        gulp.src('core/src/sparkplug.js'),
        babel(),
        gulp.dest('release')
    ]);
});

gulp.task('release-core-modules', function () {
    return pump([
        gulp.src('core/dist/modules/**/*.js'),
        babel(),
        gulp.dest('release/modules')
    ]);
});

gulp.task('release-core', gulp.series('release-core-main', 'release-sparkplug', 'release-core-modules'));

/**
 * Client
 */

import webpack from 'webpack-stream';
import clientWebpackConfig from './client/webpack.config';
import clientProductionWebpackConfig from './client/webpack.production.config';

import clientpkg from './client/package';

gulp.task('build-client', function () {
    return pump([
        gulp.src('client/src/index.js'),
        webpack(clientWebpackConfig),
        gulp.dest('client/dist')
    ]);
});

gulp.task('watch-client', function () {
    return pump([
        gulp.src('client/src/index.js'),
        webpack(Object.assign({watch: true}, clientWebpackConfig)),
        gulp.dest('client/dist')
    ]);
});

gulp.task('release-client', function () {
    return pump([
        gulp.src('client/src/index.js'),
        webpack(clientProductionWebpackConfig),
        rename(`client.${clientpkg.version}.js`),
        gulp.dest('release')
    ]);
});

/**
 * CSS Editor
 */

import csseditorWebpackConfig from './csseditor/webpack.config';
import csseditorProductionWebpackConfig from './csseditor/webpack.production.config';

gulp.task('build-csseditor', function () {
    return pump([
        gulp.src('csseditor/src/index.js'),
        webpack(csseditorWebpackConfig),
        gulp.dest('csseditor/dist')
    ]);
});

gulp.task('watch-csseditor', function () {
    return pump([
        gulp.src('csseditor/src/index.js'),
        webpack(Object.assign({watch: true}, csseditorWebpackConfig)),
        gulp.dest('csseditor/dist')
    ]);
});

gulp.task('release-csseditor', function () {
    return pump([
        gulp.src('csseditor/src/index.js'),
        webpack(csseditorProductionWebpackConfig),
        rename('csseditor.js'),
        gulp.dest('release/csseditor')
    ]);
});

/**
 * Installer
 */

import installerWebpackConfig from './installer/webpack.config';

gulp.task('build-installer', function () {
    return pump([
        gulp.src('installer/src/index.js'),
        webpack(installerWebpackConfig),
        gulp.dest('installer/dist')
    ]);
});

gulp.task('watch-installer', function () {
    return pump([
        gulp.src('installer/src/index.js'),
        webpack(Object.assign({watch: true}, installerWebpackConfig)),
        gulp.dest('installer/dist')
    ]);
});

/**
 * Release
 */

import del from 'del';
import copy from 'gulp-copy';
import copydeps from 'gulp-npm-copy-deps';
import file from 'gulp-file';
import editjson from 'gulp-json-editor';

gulp.task('release-package', function () {
    return pump([
        gulp.src('package.json'),
        editjson(function (mainpkg) {
            mainpkg.main = `core.${corepkg.version}.js`;
            delete mainpkg.devDependencies;
            delete mainpkg.scripts;
            return mainpkg;
        }),
        gulp.dest('release')
    ]);
});

gulp.task('release-index', function () {
    return pump([
        file('index.js', `module.exports = require('./core.${corepkg.version}.js');`, {src: true}),
        gulp.dest('release')
    ]);
});

gulp.task('release-node-modules', function () {
    return copydeps('.', 'release');
});

gulp.task('release-node-sass-bindings', gulp.series(function () {
    return del(['release/node_modules/node-sass/vendor']);
}, function () {
    return pump([
        gulp.src('other/node_sass_bindings/**/*'),
        copy('release/node_modules/node-sass/vendor', { prefix: 2 })
    ]);
}));

gulp.task('release-keytar-bindings', gulp.series(function () {
    return del(['release/node_modules/keytar/build']);
}, function () {
    return pump([
        gulp.src('other/keytar/**/*'),
        copy('release/node_modules/keytar/build/Release', {prefix: 2})
    ]);
}));

gulp.task('release-dependencies', gulp.series('release-node-modules', gulp.parallel('release-node-sass-bindings', 'release-keytar-bindings')));

gulp.task('build-release', gulp.parallel('release-package', 'release-index', 'release-core', 'release-client', 'release-csseditor', 'release-dependencies'));

/**
 * Package release
 */

import archiver from 'gulp-archiver';

gulp.task('package-release-core', function () {
    return pump([
        gulp.src(['release/package.json', 'release/index.js', `release/core.${corepkg.version}.js`, 'release/sparkplug.js', 'release/modules/**/*', 'release/node_modules/**/*'], {base: 'release'}),
        archiver('core.zip'),
        gulp.dest('release')
    ]);
});

gulp.task('package-release-client', function () {
    return pump([
        gulp.src(`release/client.${clientpkg.version}.js`),
        archiver('client.zip'),
        gulp.dest('release')
    ]);
});

gulp.task('package-release-csseditor', function () {
    return pump([
        gulp.src('release/csseditor/**/*', {base: 'release'}),
        archiver('csseditor.zip'),
        gulp.dest('release')
    ]);
});

gulp.task('package-release-all', function () {
    return pump([
        gulp.src('release/*.zip'),
        archiver('full.zip'),
        gulp.dest('release')
    ]);
});

gulp.task('package-release', gulp.series(gulp.parallel('package-release-core', 'package-release-client', 'package-release-csseditor'), 'package-release-all'));

/**
 * Other
 */

gulp.task('build', gulp.parallel('build-core', 'build-client', 'build-csseditor'));
gulp.task('watch', gulp.parallel('watch-core', 'watch-client', 'watch-csseditor'));

gulp.task('release', gulp.series(function () {
    return del(['release/**/*']);
}, 'build-release', 'package-release'));
