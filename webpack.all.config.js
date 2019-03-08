const path = require('path');

const editor = require('./editor/webpack.config');

editor.output.path = path.resolve('editor', 'dist');
editor.entry = path.resolve('editor', editor.entry);
editor.resolve.alias['vue$'] = path.resolve('node_modules', 'vue', 'dist', 'vue.esm.js');
editor.resolve.modules = [
    path.resolve('node_modules'),
    path.resolve('common', 'modules')
];

const client = require('./client/webpack.config');

client.output.path = path.resolve('client', 'dist');
client.entry = path.resolve('client', client.entry);
client.resolve.alias['vue$'] = path.resolve('node_modules', 'vue', 'dist', 'vue.esm.js');
client.resolve.modules = [
    path.resolve('node_modules'),
    path.resolve('common', 'modules'),
    path.resolve('client', 'src', 'modules'),
    path.resolve('client', 'src', 'ui'),
    path.resolve('client', 'src', 'plugins'),
    path.resolve('client', 'src', 'structs'),
    path.resolve('client', 'src', 'builtin')
];

module.exports = [editor, client];
