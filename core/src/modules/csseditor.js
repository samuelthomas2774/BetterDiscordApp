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

    /**
     * Opens an editor and replies to an IPC event.
     * @param {BDIpcEvent} event
     */
    openEditor(o) {
        if (this.editor) {
            if (this.editor.isFocused()) return;

            this.editor.focus();
            this.editor.flashFrame(true);
            o.reply(true);
            return;
        }

        const options = Object.assign({}, this.options, o.message);

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

    /**
     * Sets the SCSS in the editor.
     */
    setSCSS(scss) {
        this.send('set-scss', scss);
    }

    /**
     * Sends data to the editor.
     * @param {String} channel
     * @param {Any} data
     */
    send(channel, data) {
        if (!this.editor) return;
        this.editor.webContents.send(channel, data);
    }

    /**
     * Sets the CSS editor's always on top flag.
     */
    set alwaysOnTop(state) {
        if (!this.editor) return;
        this.editor.setAlwaysOnTop(state);
    }

    /**
     * Default options to pass to BrowserWindow.
     */
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
