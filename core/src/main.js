/**
 * BetterDiscord Core Entry
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { Utils, FileUtils, BDIpc, Config, WindowUtils, CSSEditor, Database } = require('./modules');

const { BrowserWindow, dialog } = require('electron');
const path = require('path');
const sass = require('node-sass');

/**
 * DEVELOPMENT VARIABLES
 */
const clientScriptPath = path.resolve(__dirname, '..', '..', 'client', 'dist');

const __dataPath = path.resolve(__dirname, '..', '..', 'tests', 'data');
const __pluginPath = path.resolve(__dirname, '..', '..', 'tests', 'plugins');
const __themePath = path.resolve(__dirname, '..', '..', 'tests', 'themes');
const __modulePath = path.resolve(__dirname, '..', '..', 'tests', 'modules');

const dummyArgs = {
    version: '2.0.0a',
    paths: [
        // { id: 'base', path: 'basePath' },
        { id: 'data', path: __dataPath },
        { id: 'plugins', path: __pluginPath },
        { id: 'themes', path: __themePath },
        { id: 'modules', path: __modulePath }
    ]
};

class Comms {
    constructor(bd) {
        this.bd = bd;
        this.initListeners();
    }

    initListeners() {
        BDIpc.on('bd-getConfig', o => {
            o.reply(this.bd.config.config);
        });

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
                    const ret = await this.bd.database.exec(o.args);
                    o.reply(ret);
                } catch (err) {
                    o.reply({err});
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
            // Creating two BetterDiscord objects???
            console.log('Creating two BetterDiscord objects???');
            return undefined;
        }
        BetterDiscord.loaded = true;

        this.injectScripts = this.injectScripts.bind(this);

        this.clientScriptPath = `${clientScriptPath}/betterdiscord.client.js`;
        this.config = new Config(args || dummyArgs);
        this.comms = new Comms(this);

        console.log('Starting BetterDiscord with the configuration', this.config.config);

        this.init();
    }

    async init() {
        this.database = new Database(this.config.paths.find(path => path.id === 'data').path);

        await this.waitForWindowUtils();

        this.csseditor = new CSSEditor(this);

        this.windowUtils.on('did-get-response-details', () => BetterDiscord.ignite(this.windowUtils.window));
        this.windowUtils.on('did-finish-load', () => this.injectScripts(true));

        this.windowUtils.on('did-navigate-in-page', (event, url, isMainFrame) => {
            this.windowUtils.send('did-navigate-in-page', { event, url, isMainFrame });
        });

        setTimeout(() => {
            this.injectScripts();
        }, 500);
    }

    /**
     * Returns the main window.
     * @return {Promise}
     */
    async waitForWindow() {
        return new Promise((resolve, reject) => {
            if (this.windowUtils)
                return resolve(this.windowUtils.window);

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

    /**
     * Returns a WindowUtils object for the main window.
     * @return {Promise}
     */
    async waitForWindowUtils() {
        if (this.windowUtils)
            return this.windowUtils;

        const window = await this.waitForWindow();
        return this.windowUtils = new WindowUtils({ window });
    }

    /**
     * Hooks things that Discord removes from global. These will be removed again in the client script.
     * @param {BrowserWindow} window
     */
    ignite() {
        return BetterDiscord.ignite(this.windowUtils.window);
    }

    static ignite(window) {
        return WindowUtils.injectScript(window, path.resolve(__dirname, 'sparkplug.js'));
    }

    /**
     * Injects the client script into the main window.
     * @param {Boolean} reload Whether the window is being reloaded
     */
    injectScripts(reload = false) {
        console.log(`RELOAD? ${reload}`);
        this.windowUtils.injectScript(this.clientScriptPath);
    }
}

module.exports = {
    BetterDiscord
};
