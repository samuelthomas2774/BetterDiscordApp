/**
 * BetterDiscord Editor Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import path from 'path';
import { BrowserWindow } from 'electron';

import Module from './modulebase';
import { WindowUtils, FileUtils } from './utils';
import BDIpc from './bdipc';

export default class Editor extends Module {

    constructor(bd, path) {
        super();
        this.editorPath = path;
        this.bd = bd;
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('openCssEditor', (event, options) => this.openEditor(options), true);
        BDIpc.on('editor-open', (event, options) => this.openEditor(options), true);

        BDIpc.on('editor-runScript', async (event, script) => {
            const result = await this.sendToDiscord('editor-runScript', script);
            event.reply(result);
        });

        BDIpc.on('editor-getFiles', async (event) => {
            const exclude = ['db.json', 'emotes.json', 'storage', 'user.settings.json', 'window.json'];
            const listFiles = await FileUtils.listDirectory(this.bd.config.getPath('data'));
            const files = listFiles.filter(file => !exclude.includes(file));

            const constructFiles = files.map(async file => {
                const content = await FileUtils.readFile(path.resolve(this.bd.config.getPath('data'), file));
                return { type: 'file', name: file, saved: true, mode: this.resolveMode(file), content, savedContent: content };
            });

            const awaitFiles = await Promise.all(constructFiles);

            event.reply(awaitFiles);
        });

        BDIpc.on('editor-getSnippets', async (event) => {
            event.reply([
                { type: 'snippet', name: 'test.js', content: '', savedContent: '', mode: 'javascript', saved: true }
            ]);
        });

        BDIpc.on('editor-saveFile', async (event, file) => {
            try {
                await FileUtils.writeFile(path.resolve(this.bd.config.getPath('data'), file.name), file.content);
                event.reply('ok');
            } catch (err) {
                event.reply({ err });
            }
        });

        BDIpc.on('editor-saveSnippet', async (event, snippet) => {
            // TODO not sure how to store snippets yet
            console.log(snippet);
            event.reply('ok');
        });
    }

    resolveMode(fileName) {
        if (!fileName.includes('.')) return 'text';
        const ext = fileName.substr(fileName.lastIndexOf('.') + 1);
        if (this.modes.hasOwnProperty(ext)) return this.modes[ext];
        return 'text';
    }

    get modes() {
        return {
            'css': 'css',
            'scss': 'scss',
            'js': 'js',
            'txt': 'text',
            'json': 'json'
        };
    }

    /**
     * Opens an editor.
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
                this.bd.windowUtils.send('bd-save-csseditor-bounds', this.editor.getBounds());
                this.editor = null;
            });

            this.editor.once('ready-to-show', () => {
                this.editor.show();
            });

            this.editor.webContents.on('did-finish-load', () => {
                this.editorUtils.injectScript(path.join(this.editorPath, 'editor.js'));
                resolve(true);
            });
        })
    }

    /**
     * Sends data to the editor.
     * @param {String} channel
     * @param {Any} data
     */
    send(channel, data) {
        if (!this.editor) throw { message: 'The CSS editor is not open.' };
        return BDIpc.send(this.editor, channel, data);
    }

    async sendToDiscord(channel, message) {
        return this.bd.windowUtils.send(channel, message);
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
