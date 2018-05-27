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
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'csseditor-release.js'
    },
    module: {
        loaders: [vueLoader, scssLoader]
    },
    externals: {
        electron: 'window.require("electron")',
        fs: 'window.require("fs")'
    },
    resolve: {
        alias: {
            vue$: path.resolve('..', 'node_modules', 'vue', 'dist', 'vue.esm.js')
        },
        modules: [
            path.resolve('..', 'node_modules'),
            path.resolve('..', 'common', 'modules')
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true)
        }),
        new UglifyJsPlugin()
    ]
};
