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
const { BDIpc } = require('./bdipc');
const { WindowUtils } = require('./utils');

class CSSEditor extends Module {

    constructor(bd) {
        super();
        this.bd = bd;
    }

    /**
     * Opens the CSS editor.
     * @param {Object} options Additional options to pass to BrowserWindow
     * @return {Promise}
     */
    openEditor(options) {
        return new Promise((resolve, reject) => {
            if (this.editor) {
                if (this.editor.isFocused()) return;

                this.editor.focus();
                this.editor.flashFrame(true);
                return resolve(true);
            }

            options = Object.assign({}, this.options, options);

            this.editor = new BrowserWindow(options);
            this.editor.loadURL('about:blank');
            this.editor.setSheetOffset(33);
            this.editorUtils = new WindowUtils({ window: this.editor });

            this.editor.on('close', () => {
                BDIpc.send(this.bd.windowUtils.window, 'bd-save-csseditor-bounds', this.editor.getBounds());
                BDIpc.send(this.bd.windowUtils.window, 'csseditor-closed');
                this.editor = null;
            });

            this.editor.once('ready-to-show', () => {
                this.editor.show();
            });

            this.editor.webContents.on('did-finish-load', () => {
                this.editorUtils.injectScript(path.join(this.editorPath, 'csseditor.js'));
                resolve(true);
            });
        });
    }

    /**
     * Sends data to the editor.
     * @param {String} channel
     * @param {Any} data
     */
    send(channel, data) {
        if (!this.editor) return;
        return BDIpc.send(this.editor, channel, data);
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

    /**
     * The CSS editor's path.
     */
    get editorPath() {
        return path.resolve(__dirname, '..', '..', '..', 'csseditor', 'dist');
    }

}

module.exports = { CSSEditor };
