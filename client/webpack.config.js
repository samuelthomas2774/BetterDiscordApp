const path = require('path');
const webpack = require('webpack');

const jsLoader = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    query: {
        presets: ['react']
    }
};

const vueLoader = {
    test: /\.(vue)$/,
    loader: 'vue-loader'
};

const scssLoader = {
    test: /\.scss$/,
    exclude: /node_modules/,
    loader: ['css-loader', 'sass-loader']
};

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'betterdiscord.client.js'
    },
    module: {
        loaders: [jsLoader, vueLoader, scssLoader]
    },
    externals: {
        electron: 'window.require("electron")',
        fs: 'window.require("fs")',
        path: 'window.require("path")',
        sparkplug: 'require("../../core/dist/sparkplug")'
    },
    resolve: {
        alias: {
            vue$: path.resolve('..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        },
        modules: [
            path.resolve('..', 'node_modules'),
            path.resolve('src', 'modules'),
            path.resolve('..', 'common', 'modules'),
            path.resolve('src', 'ui'),
            path.resolve('src', 'plugins'),
            path.resolve('src', 'structs'),
            path.resolve('src', 'builtin')
        ]
    },
    node: {
        __filename: false,
        __dirname: false
    }
};
