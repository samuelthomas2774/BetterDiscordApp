const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const vueLoader = {
    test: /\.(vue)$/,
    exclude: /node_modules/,
    use: 'vue-loader'
};

const scssLoader = {
    test: /\.(css|scss)$/,
    use: ['css-loader', 'sass-loader']
};

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'csseditor-release.js'
    },
    module: {
        rules: [vueLoader, scssLoader]
    },
    externals: {
        electron: 'window.require("electron")',
        fs: 'window.require("fs")',
        util: 'window.require("util")',
        process: 'require("process")'
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
        new VueLoaderPlugin()
    ]
};
