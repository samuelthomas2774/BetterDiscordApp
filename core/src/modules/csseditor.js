/**
 * BetterDiscord CSSEditor Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const path = require('path');
const { BrowserWindow } = require('electron');

const { Module } = require('./modulebase');
const { WindowUtils } = require('./utils');

class CSSEditor extends Module {

    constructor(bd, path) {
        super();
        this.editorPath = path;
        this.bd = bd;
    }

    openEditor(o) {
        if (this.editor) {
            if (this.editor.isFocused()) return;

            this.editor.focus();
            this.editor.flashFrame(true);
            o.reply(true);
            return;
        }

        const options = this.options;
        for (let option in o.args) {
            if (o.args.hasOwnProperty(option)) {
                options[option] = o.args[option];
            }
        }

        this.editor = new BrowserWindow(options);
        this.editor.loadURL('about:blank');
        this.editor.setSheetOffset(33);
        this.editorUtils = new WindowUtils({ window: this.editor });

        this.editor.on('close', () => {
            this.bd.windowUtils.send('bd-save-csseditor-bounds', this.editor.getBounds());
            this.editor = null;
        });

        this.editor.once('ready-to-show', () => {
            this.editor.show();
        });

        this.editor.webContents.on('did-finish-load', () => {
            this.editorUtils.injectScript(path.join(this.editorPath, 'csseditor.js'));
            o.reply(true);
        });
    }

    setSCSS(scss) {
        this.send('set-scss', scss);
    }

    send(channel, data) {
        if (!this.editor) return;
        this.editor.webContents.send(channel, data);
    }

    set alwaysOnTop(state) {
        if (!this.editor) return;
        this.editor.setAlwaysOnTop(state);
    }

    get options() {
        return {
            width: 800,
            height: 600,
            show: false,
            frame: false
        };
    }
    
}

module.exports = { CSSEditor };
