/**
 * BetterDiscord CSS Editor
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

const { Module } = require('./modulebase');
const { BDIpc } = require('./bdipc');
const $ = require('jquery');

class CssEditor extends Module {

    setInitialState() {
        this.state = {
            css: ''
        }
        this.customcss = $('<style id="customcss">').appendTo("head");
        window.cssEditor = this;

        BDIpc.on("bd-update-css", (_, css) => this.customcss.text(css));
        BDIpc.on("bd-save-css", (_, css) => this.setState({css}));
    }

    show() {
        BDIpc.send('openCssEditor', {}).then(() => BDIpc.send('setCss', {css: this.state.css}));
    }
}

const _instance = new CssEditor();
module.exports = { 'CssEditor': _instance }