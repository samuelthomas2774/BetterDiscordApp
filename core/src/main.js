/**
 * BetterDiscord Core Entry
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const path = require('path');
const sass = require('node-sass');
const { BrowserWindow, dialog } = require('electron');

const { FileUtils, BDIpc, Config, WindowUtils, CSSEditor, Database } = require('./modules');

const tests = true;

const _basePath = tests ? path.resolve(__dirname, '..', '..') : __dirname;
const _baseDataPath = tests ? path.resolve(_basePath, 'tests') : _basePath;

const sparkplug = path.resolve(__dirname, 'sparkplug.js');

const _clientScript = tests
    ? path.resolve(_basePath, 'client', 'dist', 'betterdiscord.client.js')
    : path.resolve(_basePath, 'betterdiscord.client.js');
const _cssEditorPath = tests
    ? path.resolve(__dirname, '..', '..', 'csseditor', 'dist')
    : path.resolve(__dirname, 'csseditor');

const _dataPath = path.resolve(_baseDataPath, 'data');
const _extPath = path.resolve(_baseDataPath, 'ext');
const _pluginPath = path.resolve(_extPath, 'plugins');
const _themePath = path.resolve(_extPath, 'themes');
const _modulePath = path.resolve(_extPath, 'modules');

const version = require(path.resolve(_basePath, 'package.json')).version;

const paths = [
    { id: 'base', path: _basePath },
    { id: 'cs', path: _clientScript },
    { id: 'data', path: _dataPath },
    { id: 'ext', path: _extPath },
    { id: 'plugins', path: _pluginPath },
    { id: 'themes', path: _themePath },
    { id: 'modules', path: _modulePath },
    { id: 'csseditor', path: _cssEditorPath }
];

const globals = {
    version,
    paths
};

class Comms {

    constructor(bd) {
        this.bd = bd;
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('bd-getConfig', o => o.reply(this.bd.config.config));

        BDIpc.on('bd-sendToDiscord', event => this.bd.windowUtils.send(event.args.channel, event.args.message));

        BDIpc.on('bd-openCssEditor', o => this.bd.csseditor.openEditor(o));
        // BDIpc.on('bd-setScss', o => this.bd.csseditor.setSCSS(o.args.scss));
        BDIpc.on('bd-sendToCssEditor', o => this.bd.csseditor.send(o.args.channel, o.args.data));

        BDIpc.on('bd-native-open', o => {
            dialog.showOpenDialog(BrowserWindow.fromWebContents(o.ipcEvent.sender), o.args, filenames => {
                o.reply(filenames);
            });
        });

        BDIpc.on('bd-compileSass', o => {
            if (!o.args.path && !o.args.data) return o.reply('');
            if (typeof o.args.path === 'string' && typeof o.args.data === 'string') {
                o.args.data = `${o.args.data} @import '${o.args.path.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}';`;
                o.args.path = undefined;
            }

            sass.render(o.args, (err, result) => {
                if (err) return o.reply({ err });
                else o.reply(result);
            });
        });

        BDIpc.on('bd-dba', o => {
            (async () => {
                try {
                    o.reply(await this.bd.dbInstance.exec(o.args));
                } catch (err) {
                    o.reply({ err });
                }
            })();
        });
    }

    async send(channel, message) {
        BDIpc.send(channel, message);
    }

}

class BetterDiscord {

    constructor(args) {
        if (BetterDiscord.loaded) {
            console.log('Creating two BetterDiscord objects???');
            return null;
        }
        BetterDiscord.loaded = true;

        this.injectScripts = this.injectScripts.bind(this);
        this.ignite = this.ignite.bind(this);

        this.config = new Config(args || globals);
        this.dbInstance = new Database(this.config.getPath('data'));
        this.comms = new Comms(this);

        this.init();
    }

    async init() {
        await this.waitForWindowUtils();

        if (!tests) {
            const basePath = this.config.getPath('base');
            const files = await FileUtils.listDirectory(basePath);
            const latestCs = FileUtils.resolveLatest(files, file => file.endsWith('.js') && file.startsWith('client.'), file => file.replace('client.', '').replace('.js', ''), 'client.', '.js');
            this.config.getPath('cs', true).path = path.resolve(basePath, latestCs);
        }

        await FileUtils.ensureDirectory(this.config.getPath('ext'));

        this.csseditor = new CSSEditor(this, this.config.getPath('csseditor'));

        this.windowUtils.on('did-get-response-details', () => this.ignite());
        this.windowUtils.on('did-finish-load', () => this.injectScripts(true));

        this.windowUtils.on('did-navigate-in-page', (event, url, isMainFrame) => {
            this.windowUtils.send('did-navigate-in-page', { event, url, isMainFrame });
        });

        setTimeout(() => {
            this.injectScripts();
        }, 500);
    }

    async waitForWindow() {
        const self = this;
        return new Promise(resolve => {
            const defer = setInterval(() => {
                const windows = BrowserWindow.getAllWindows();

                for (let window of windows) {
                    BetterDiscord.ignite(window);
                }

                if (windows.length === 1 && windows[0].webContents.getURL().includes('discordapp.com')) {
                    resolve(windows[0]);
                    clearInterval(defer);
                }
            }, 10);
        });
    }

    async waitForWindowUtils() {
        if (this.windowUtils) return this.windowUtils;
        const window = await this.waitForWindow();
        return this.windowUtils = new WindowUtils({ window });
    }

    get window() {
        return this.windowUtils ? this.windowUtils.window : undefined;
    }

    /**
     * Hooks things that Discord removes from global. These will be removed again in the client script.
     */
    ignite() {
        return BetterDiscord.ignite(this.window);
    }

    /**
     * Hooks things that Discord removes from global. These will be removed again in the client script.
     * @param {BrowserWindow} window The window to inject the sparkplug script into
     */
    static ignite(window) {
        return WindowUtils.injectScript(window, sparkplug);
    }

    /**
     * Injects the client script into the main window.
     * @param {Boolean} reload Whether the main window was reloaded
     */
    async injectScripts(reload = false) {
        console.log(`RELOAD? ${reload}`);
        return this.windowUtils.injectScript(this.config.getPath('cs'));
    }

}

module.exports = {
    BetterDiscord
};
