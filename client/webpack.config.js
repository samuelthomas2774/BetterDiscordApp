const path = require('path');

const baseconfig = require('./webpack.base.config');

const merge = require('webpack-merge');
const webpack = require('webpack');

const config = {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'betterdiscord.client.js'
    },
    plugins: [
        new webpack.NamedModulesPlugin()
    ],
    externals: {
        asar: 'require("asar")'
    }
};

module.exports = merge(baseconfig, config);
