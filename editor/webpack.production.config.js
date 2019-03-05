const path = require('path');

const baseconfig = require('./webpack.base.config');

const merge = require('webpack-merge');
const webpack = require('webpack');

const config = {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'editor.release.js'
    }
};

module.exports = merge(baseconfig, config);
