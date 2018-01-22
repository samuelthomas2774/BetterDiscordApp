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

/**
 * DEVELOPMENT VARIABLES
 */
const clientScriptPath = path.resolve(__dirname, '..', '..', 'client', 'dist').replace(/\\/g, '/');

const __DEV = {
    TESTING: false,
    clientScriptPath: `${clientScriptPath}/betterdiscord.client.js`
}

const __pluginPath = path.resolve(__dirname, '..', '..', 'tests', 'plugins');
const __themePath = path.resolve(__dirname, '..', '..', 'tests', 'themes');

const { Utils, FileUtils, BDIpc, Config, WindowUtils, CSSEditor } = require('./modules');
const { BrowserWindow } = require('electron');

const Common = {};

const dummyArgs = {
    'version': '0.3.1',
    'paths': [
        { 'id': 'base', 'path': 'basePath' },
        { 'id': 'plugins', 'path': __pluginPath },
        { 'id': 'themes', 'path': __themePath }
    ]
};

console.log(dummyArgs);


class Comms {

    constructor() {
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('bd-getConfig', o => {
            o.reply(Common.Config.config);
        });

        BDIpc.on('bd-openCssEditor', o => CSSEditor.openEditor(o));
        BDIpc.on('bd-setCss', o => CSSEditor.setCSS(o.args));

        BDIpc.on('bd-readFile', this.readFile);
        BDIpc.on('bd-readJson', o => this.readFile(o, true));
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
        this.injectScripts = this.injectScripts.bind(this);
        this.ignite = this.ignite.bind(this);
        Common.Config = new Config(args || dummyArgs);
        this.comms = new Comms();
        this.init();
    }

    async init() {
        const window = await this.waitForWindow();
        this.windowUtils = new WindowUtils({ window });

        //Log some events for now
        //this.windowUtils.webContents.on('did-start-loading', e =>  this.windowUtils.executeJavascript(`console.info('did-start-loading');`));
        //this.windowUtils.webContents.on('did-stop-loading', e => this.windowUtils.executeJavascript(`console.info('did-stop-loading');`));
        //this.windowUtils.webContents.on('did-get-response-details', e => this.ignite(this.windowUtils.window));
        //this.windowUtils.webContents.on('page-favicon-updated', e => this.windowUtils.executeJavascript(`console.info('page-favicon-updated');`));
        //this.windowUtils.webContents.on('will-navigate', e => this.windowUtils.executeJavascript(`console.info('will-navigate');`));
        //this.windowUtils.webContents.on('did-navigate', e => this.windowUtils.executeJavascript(`console.info('did-navigate');`));
        //this.windowUtils.webContents.on('did-navigate-in-page', e => this.windowUtils.executeJavascript(`console.info('did-navigate-in-page');`));
        //this.windowUtils.webContents.on('did-finish-load', e => this.injectScripts(true));

        this.windowUtils.events('did-get-response-details', () => this.ignite(this.windowUtils.window));
        this.windowUtils.events('did-finish-load', e => this.injectScripts(true));

        this.windowUtils.events('did-navigate-in-page', (event, url, isMainFrame) => {
            this.windowUtils.send('did-navigate-in-page', { event, url, isMainFrame });
        });

        BDIpc.on('bd-sendToDiscord', event => this.windowUtils.send(event.args.channel, event.args.message))

        setTimeout(() => {
            if (__DEV) { this.injectScripts(); }
        }, 500);
    }

    async waitForWindow() {
        const self = this;
        return new Promise((resolve, reject) => {
            const defer = setInterval(() => {
                const windows = BrowserWindow.getAllWindows();

                if (windows.length > 0) {
                    windows.forEach(window => {
                        self.ignite(window);
                    });
                }

                if (__DEV && __DEV.TESTING && windows.length > 0) {
                    resolve(windows[0]);
                    clearInterval(defer);
                    return;
                }

                if (windows.length === 1 && windows[0].webContents.getURL().includes("discordapp.com")) {
                    resolve(windows[0]);
                    clearInterval(defer);
                }
            }, 10);
        });
    }

    ignite(window) {
        //Hook things that Discord removes from global. These will be removed again in the client script
        const sp = path.resolve(__dirname, 'sparkplug.js').replace(/\\/g, '/');
        window.webContents.executeJavaScript(`require("${sp}");`);
    }

    injectScripts(reload = false) {
        console.log(`RELOAD? ${reload}`);
        if (__DEV) {
            this.windowUtils.injectScript(__DEV.clientScriptPath);
        }
    }

    get fileUtils() { return FileUtils; }

}

module.exports = {
    BetterDiscord
}