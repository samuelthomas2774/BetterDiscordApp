const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'betterdiscord.client-release.js'
    },
    module: {
        loaders: [jsLoader, vueLoader, scssLoader]
    },
    externals: {
        electron: 'require("electron")',
        fs: 'require("fs")',
        path: 'require("path")',
        util: 'require("util")',
        process: 'require("process")',
        net: 'require("net")',
        'node-crypto': 'require("crypto")',
        request: 'require(require("path").join(require("electron").remote.app.getAppPath(), "node_modules", "request"))',
        sparkplug: 'require("./sparkplug")'
    },
    resolve: {
        alias: {
            vue$: path.resolve(__dirname, '..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        },
        modules: [
            path.resolve(__dirname, '..', 'node_modules'),
            path.resolve(__dirname, '..', 'common', 'modules'),
            path.resolve(__dirname, 'src', 'modules'),
            path.resolve(__dirname, 'src', 'ui'),
            path.resolve(__dirname, 'src', 'plugins'),
            path.resolve(__dirname, 'src', 'structs'),
            path.resolve(__dirname, 'src', 'builtin')
        ]
    },
    node: {
        process: false,
        __filename: false,
        __dirname: false
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        }),
        new UglifyJsPlugin()
    ]
};
