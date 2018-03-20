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

const { FileUtils, BDIpc, Config, WindowUtils, CSSEditor, Database } = require('./modules');
const { BrowserWindow, dialog } = require('electron');

const tests = false;
const _basePath = __dirname;
const _clientScript = tests
    ? path.resolve(__dirname, '..', '..', 'client', 'dist', 'betterdiscord.client.js')
    : path.resolve(__dirname, 'betterdiscord.client.js');
const _dataPath = tests
    ? path.resolve(__dirname, '..', '..', 'tests', 'data')
    : path.resolve(__dirname, 'data');
const _extPath = tests
    ? path.resolve(__dirname, '..', '..', 'tests', 'ext')
    : path.resolve(__dirname, 'ext');
const _pluginPath = path.resolve(_extPath, 'plugins');
const _themePath = path.resolve(_extPath, 'themes');
const _modulePath = path.resolve(_extPath, 'modules');
const _cssEditorPath = tests
    ? path.resolve(__dirname, '..', '..', 'csseditor', 'dist')
    : path.resolve(__dirname, 'csseditor');

const paths = [
    { id: 'base', path: _basePath.replace(/\\/g, '/') },
    { id: 'cs', path: _clientScript.replace(/\\/g, '/') },
    { id: 'data', path: _dataPath.replace(/\\/g, '/') },
    { id: 'ext', path: _extPath.replace(/\\/g, '/') },
    { id: 'plugins', path: _pluginPath.replace(/\\/g, '/') },
    { id: 'themes', path: _themePath.replace(/\\/g, '/') },
    { id: 'modules', path: _modulePath.replace(/\\/g, '/') },
    { id: 'csseditor', path: _cssEditorPath.replace(/\\/g, '/') }
];

const sparkplug = path.resolve(__dirname, 'sparkplug.js').replace(/\\/g, '/');

const Common = {};
const globals = {
    version: '2.0.0a',
    paths
}

const dbInstance = new Database(paths.find(path => path.id === 'data').path);

class Comms {

    constructor(bd) {
        this.bd = bd;
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('bd-getConfig', o => {
            o.reply(Common.Config.config);
        });

        BDIpc.on('bd-sendToDiscord', event => this.bd.windowUtils.send(event.args.channel, event.args.message));

        BDIpc.on('bd-openCssEditor', o => this.bd.csseditor.openEditor(o));
        // BDIpc.on('bd-setScss', o => this.bd.csseditor.setSCSS(o.args.scss));
        BDIpc.on('bd-sendToCssEditor', o => this.bd.csseditor.send(o.args.channel, o.args.data));

        BDIpc.on('bd-readFile', this.readFile);
        BDIpc.on('bd-readJson', o => this.readFile(o, true));

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
                if (err) {
                    o.reply({ err });
                    return;
                }
                o.reply(result);
            });
        });

        BDIpc.on('bd-dba', o => {
            (async () => {
                try {
                    const ret = await dbInstance.exec(o.args);
                    o.reply(ret);
                } catch (err) {
                    o.reply({err});
                }
            })();
        });
    }

    async readFile(o, json) {
        const { path } = o.args;
        try {
            const readFile = json ? await FileUtils.readJsonFromFile(path) : await FileUtils.readFile(path);
            o.reply(readFile);
        } catch (err) {
            o.reply(err);
        }
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
        Common.Config = new Config(globals);
        this.comms = new Comms(this);
        this.init();
    }

    async init() {
        const window = await this.waitForWindow();
        this.windowUtils = new WindowUtils({ window });

        await FileUtils.ensureDirectory(paths.find(path => path.id === 'ext').path);

        if (!tests) {
            const files = await FileUtils.listDirectory(paths.find(path => path.id === 'base').path);
            const latestCs = FileUtils.resolveLatest(files, file => file.endsWith('.js') && file.startsWith('client.'), file => file.replace('client.', '').replace('.js', ''), 'client.', '.js');
            paths.find(path => path.id === 'cs').path = path.resolve(paths.find(path => path.id === 'base').path, latestCs).replace(/\\/g, '/');
        }

        this.csseditor = new CSSEditor(this, paths.find(path => path.id === 'csseditor').path);

        this.windowUtils.events('did-get-response-details', () => this.ignite(this.windowUtils.window));
        this.windowUtils.events('did-finish-load', e => this.injectScripts(true));

        this.windowUtils.events('did-navigate-in-page', (event, url, isMainFrame) => {
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

                if (windows.length > 0) {
                    windows.forEach(window => {
                        self.ignite(window);
                    });
                }

                if (windows.length === 1 && windows[0].webContents.getURL().includes('discordapp.com')) {
                    resolve(windows[0]);
                    clearInterval(defer);
                }
            }, 10);
        });
    }

    ignite(window) {
        //Hook things that Discord removes from global. These will be removed again in the client script
        window.webContents.executeJavaScript(`require("${sparkplug}");`);
    }

    async injectScripts(reload = false) {
        console.log(`RELOAD? ${reload}`);
        if (!tests) {
            const files = await FileUtils.listDirectory(paths.find(path => path.id === 'base').path);
            const latestCs = FileUtils.resolveLatest(files, file => file.endsWith('.js') && file.startsWith('client.'), file => file.replace('client.', '').replace('.js', ''), 'client.', '.js');
            paths.find(path => path.id === 'cs').path = path.resolve(paths.find(path => path.id === 'base').path, latestCs).replace(/\\/g, '/');
        }
        this.windowUtils.injectScript(paths.find(path => path.id === 'cs').path);
    }

    get fileUtils() { return FileUtils; }

}

module.exports = {
    BetterDiscord
};
