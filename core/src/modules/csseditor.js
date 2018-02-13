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

    openEditor(o) {
        if (this.editor) {
            if (this.editor.isFocused()) return;

            this.editor.focus();
            this.editor.flashFrame(true);
            o.reply(true);
            return;
        }

        this.editor = new BrowserWindow(this.options);
        this.editor.loadURL('about:blank');
        this.editor.setSheetOffset(33);
        this.editorUtils = new WindowUtils({ window: this.editor });

        this.editor.webContents.on('close', () => {
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

    //TODO user options from config
    get options() {
        return {
            width: 800,
            height: 600,
            show: false,
            frame: false
        };
    }

    //TODO Currently uses a development path
    get editorPath() {
        return path.resolve(__dirname, '..', '..', '..', 'csseditor', 'dist');
        // return path.resolve(__dirname, '..', '..', '..', 'tests', 'csseditor');
    }

}

module.exports = {
    CSSEditor: new CSSEditor()
};
