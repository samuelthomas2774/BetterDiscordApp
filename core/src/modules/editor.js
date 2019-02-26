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
import sass from 'node-sass';

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
            try {
                const files = await FileUtils.listDirectory(this.bd.config.getPath('userfiles'));

                const constructFiles = await Promise.all(files.map(async file => {
                    const content = await FileUtils.readFile(path.resolve(this.bd.config.getPath('userfiles'), file));
                    return { type: 'file', name: file, saved: true, mode: this.resolveMode(file), content, savedContent: content };
                }));

                const userscssPath = path.resolve(this.bd.config.getPath('data'), 'user.scss');
                const userscss = await FileUtils.readFile(userscssPath);
                constructFiles.push({
                    caption: 'user',
                    type: 'file',
                    name: 'user.scss',
                    saved: true,
                    mode: 'scss',
                    content: userscss,
                    savedContent: userscss,
                    hoisted: true
                });

                event.reply(constructFiles);
            } catch (err) {
                console.log(err);
                event.reject({ err });
            }
        });

        BDIpc.on('editor-getSnippets', async (event) => {
            try {
                const files = await FileUtils.listDirectory(this.bd.config.getPath('snippets'));

                const constructFiles = await Promise.all(files.map(async file => {
                    const content = await FileUtils.readFile(path.resolve(this.bd.config.getPath('snippets'), file));
                    return { type: 'snippet', name: file, saved: true, mode: this.resolveMode(file), content, savedContent: content };
                }));

                event.reply(constructFiles);
            } catch (err) {
                console.log(err);
                event.reject({ err });
            }
        });

        BDIpc.on('editor-saveFile', async (event, file) => {
            const filePath = (file.hoisted && file.name === 'user.scss') ?
                path.resolve(this.bd.config.getPath('data'), 'user.scss') :
                path.resolve(this.bd.config.getPath('userfiles'), file.name);

            try {
                await FileUtils.writeFile(filePath, file.content);
                event.reply('ok');
            } catch (err) {
                console.log(err);
                event.reject({ err });
            }
        });

        BDIpc.on('editor-saveSnippet', async (event, snippet) => {
            try {
                await FileUtils.writeFile(path.resolve(this.bd.config.getPath('snippets'), snippet.name), snippet.content);
                event.reply('ok');
            } catch (err) {
                console.log(err);
                event.reject({ err });
            }
        });

        BDIpc.on('editor-injectStyle', async (event, { id, style, mode }) => {
            if (mode !== 'scss') {
                await this.sendToDiscord('editor-injectStyle', { id, style });
                event.reply('ok');
                return;
            }

            style = await Promise.all(style.split('\n').map(async(line) => {
                if (!line.startsWith('@import')) return line;
                const filename = line.split(' ')[1].replace(/'|"|;/g, '');
                let filePath = path.resolve(this.bd.config.getPath('userfiles'), filename).replace(/\\/g, '/');

                try {
                    await FileUtils.fileExists(filePath);
                } catch (err) {
                    filePath = path.resolve(this.bd.config.getPath('snippets'), filename).replace(/\\/g, '/');
                }

                try {
                    await FileUtils.fileExists(filePath);
                } catch (err) {
                    return `/*${filename}*/`;
                }

                return `@import '${filePath}';`;
            }));

            style = style.join('\n');

            sass.render({ data: style }, (err, result) => {
                if (err) {
                    console.log(err);
                    event.reply({ err });
                    return;
                }
                const { css } = result;
                (async () => {
                    await this.sendToDiscord('editor-injectStyle', { id, style: css.toString() });
                    event.reply('ok');
                })();
            });
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
            'js': 'javascript',
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
