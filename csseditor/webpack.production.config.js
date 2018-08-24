const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const vueLoader = {
    test: /\.(vue)$/,
    exclude: /node_modules/,
    loader: 'vue-loader'
};

const scssLoader = {
    test: /\.(css|scss)$/,
    loader: ['css-loader', 'sass-loader']
};

module.exports = {
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'csseditor-release.js'
    },
    module: {
        loaders: [vueLoader, scssLoader]
    },
    externals: {
        electron: 'window.require("electron")',
        fs: 'window.require("fs")',
        util: 'window.require("util")',
        process: 'require("process")'
    },
    resolve: {
        alias: {
            vue$: path.resolve(__dirname, '..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        },
        modules: [
            path.resolve(__dirname, '..', 'node_modules'),
            path.resolve(__dirname, '..', 'common', 'modules')
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        }),
        new UglifyJsPlugin()
    ]
};
