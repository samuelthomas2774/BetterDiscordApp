const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const jsLoader = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: ['@babel/env', '@babel/react']
        }
    }
};

const vueLoader = {
    test: /\.(vue)$/,
    use: 'vue-loader'
};

const scssLoader = {
    test: /\.scss$/,
    exclude: /node_modules/,
    use: ['css-loader', 'sass-loader']
};

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'betterdiscord.client-release.js'
    },
    module: {
        rules: [jsLoader, vueLoader, scssLoader]
    },
    externals: {
        electron: 'require("electron")',
        fs: 'require("fs")',
        path: 'require("path")',
        util: 'require("util")',
        process: 'require("process")',
        net: 'require("net")',
        request: 'require(require("path").join(require("electron").remote.app.getAppPath(), "node_modules", "request"))',
        sparkplug: 'require("./sparkplug")',
        'node-crypto': 'require("crypto")',
        'child_process': 'require("child_process")'
    },
    resolve: {
        alias: {
            vue$: path.resolve('..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        },
        modules: [
            path.resolve('..', 'node_modules'),
            path.resolve('..', 'common', 'modules'),
            path.resolve('src', 'modules'),
            path.resolve('src', 'ui'),
            path.resolve('src', 'plugins'),
            path.resolve('src', 'structs'),
            path.resolve('src', 'builtin')
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
        new UglifyJsPlugin(),
        new VueLoaderPlugin()
    ]
};
