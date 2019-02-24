/**
 * BetterDiscord Core Entry
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const TESTS = typeof PRODUCTION === 'undefined';
const TEST_ARGS = () => {
    const _basePath = path.resolve(__dirname, '..', '..');
    const _baseDataPath =  path.resolve(_basePath, 'tests');
    return {
        'options': {
            'autoInject': true,
            'commonCore': true,
            'commonData': true
        },
        'paths': {
            'client': path.resolve(_basePath, 'client', 'dist'),
            'core': path.resolve(_basePath, 'core', 'dist'),
            'data': path.resolve(_baseDataPath, 'data'),
            'editor': path.resolve(_basePath, 'editor', 'dist')
        }
    }
}

import path from 'path';
import sass from 'node-sass';
import { BrowserWindow as OriginalBrowserWindow, dialog, session } from 'electron';
import deepmerge from 'deepmerge';
import ContentSecurityPolicy from 'csp-parse';
import keytar from 'keytar';

import { FileUtils, BDIpc, Config, WindowUtils, CSSEditor, Editor, Database } from './modules';

const packageJson = require(path.resolve(__dirname, 'package.json'));
const sparkplug = path.resolve(__dirname, 'sparkplug.js');

let configProxy;

const CSP = {
    'img-src': ['https://cdn.betterttv.net', 'https://cdn.frankerfacez.com'],
    'script-src': [
        `'sha256-fSHKdpQGCHaIqWP3SpJOuUHrLp49jy4dWHzZ/RBJ/p4='`, // React Devtools
        `'sha256-VFJcfKY5B3EBkFDgQnv3CozPwBlZcxwssfLVWlPFfZU='`, // Vue Devtools
        `'sha256-VzDmLZ4PxPkOS/KY7ITzLQsSWhfCnvUrNculcj8UNgE=' 'sha256-l6K+77Z1cmldR9gIvaVWlboF/zr5MXCQHcsEHfnr5TU='` // Vue Detector
    ]
};

class Comms {
    constructor(bd) {
        this.bd = bd;
        this.editorListeners = this.editorListeners.bind(this);
        this.initListeners();
    }

    initListeners() {
        this.editorListeners();

        BDIpc.on('ping', () => 'pong', true);

        BDIpc.on('bd-getConfig', () => this.bd.config.config, true);

        BDIpc.on('bd-sendToDiscord', (event, m) => this.sendToDiscord(m.channel, m.message), true);

        // BDIpc.on('bd-openCssEditor', (event, options) => this.bd.csseditor.openEditor(options), true);
        // BDIpc.on('bd-sendToCssEditor', (event, m) => this.sendToCssEditor(m.channel, m.message), true);
        BDIpc.on('bd-openCssEditor', (event, options) => this.bd.editor.openEditor(options), true);

        BDIpc.on('bd-native-open', (event, options) => {
            dialog.showOpenDialog(OriginalBrowserWindow.fromWebContents(event.ipcEvent.sender), options, filenames => {
                event.reply(filenames);
            });
        });

        BDIpc.on('bd-compileSass', (event, options) => {
            if (typeof options.path === 'string' && typeof options.data === 'string') {
                options.data = `${options.data} @import '${options.path.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}';`;
                options.path = undefined;
            }

            sass.render(options, (err, result) => {
                if (err) event.reject(err);
                else event.reply(result);
            });
        });

        BDIpc.on('bd-dba', (event, options) => this.bd.database.exec(options), true);

        BDIpc.on('bd-keytar-get', (event, { service, account }) => keytar.getPassword(service, account), true);
        BDIpc.on('bd-keytar-set', (event, { service, account, password }) => keytar.setPassword(service, account, password), true);
        BDIpc.on('bd-keytar-delete', (event, { service, account }) => keytar.deletePassword(service, account), true);
        BDIpc.on('bd-keytar-find-credentials', (event, { service }) => keytar.findCredentials(service), true);
    }

    editorListeners() {
        BDIpc.on('bd-editor-runScript', async (event, script) => {
            const result = await this.sendToDiscord('bd-runEditorScript', script);
            event.reply(result);
        });

        BDIpc.on('bd-editor-getFiles', async (event) => {
            event.reply([
                { type: 'file', name: 'custom.scss', content: '', savedContent: '', mode: 'scss', saved: true }
            ]);
        });

        BDIpc.on('bd-editor-getSnippets', async (event) => {
            event.reply([
                { type: 'snippet', name: 'test.js', content: '', savedContent: '', mode: 'javascript', saved: true }
            ]);
        });
    }

    async send(channel, message) {
        BDIpc.send(channel, message);
    }

    async sendToDiscord(channel, message) {
        return this.bd.windowUtils.send(channel, message);
    }

    async sendToCssEditor(channel, message) {
        return this.bd.csseditor.send(channel, message);
    }
}

class BrowserWindow extends OriginalBrowserWindow {
    constructor(originalOptions) {
        const userOptions = BrowserWindow.userWindowPreferences;

        const options = deepmerge(originalOptions, userOptions);
        options.webPreferences = Object.assign({}, options.webPreferences);

        // Make sure Node integration is enabled
        options.webPreferences.preload = sparkplug;

        super(options);

        Object.defineProperty(this, '__bd_preload', { value: [] });

        if (originalOptions.webPreferences && originalOptions.webPreferences.preload) {
            this.__bd_preload.push(originalOptions.webPreferences.preload);
        }
        if (userOptions.webPreferences && userOptions.webPreferences.preload) {
            this.__bd_preload.push(path.resolve(configProxy().getPath('data'), userOptions.webPreferences.preload));
        }

        Object.defineProperty(this, '__bd_options', { value: options });
        Object.freeze(options);
        Object.freeze(options.webPreferences);
        Object.freeze(this.__bd_preload);
    }

    static get userWindowPreferences() {
        try {
            const userWindowPreferences = require(path.join(configProxy().getPath('data'), 'window'));
            if (typeof userWindowPreferences === 'object') return userWindowPreferences;
        } catch (err) {
            console.log('[BetterDiscord] Error getting window preferences:', err);
        }

        return {};
    }
}

export class BetterDiscord {

    get comms() { return this._comms ? this._comms : (this._commas = new Comms(this)); }
    get database() { return this._db ? this._db : (this._db = new Database(this.config.getPath('data'))); }
    get config() { return this._config ? this._config : (this._config = new Config(this._args)); }
    get window() { return this.windowUtils ? this.windowUtils.window : undefined; }
    get editor() { return this._editor ? this._editor : (this._editor = new Editor(this, this.config.getPath('editor'))); }

    constructor(args) {
        if (TESTS) args = TEST_ARGS();
        console.log('[BetterDiscord|args] ', JSON.stringify(args, null, 4));
        if (BetterDiscord.loaded) {
            console.log('[BetterDiscord] Creating two BetterDiscord objects???');
            return null;
        }

        BetterDiscord.loaded = true;
        this._args = args;
        this.config.compatibility();

        this.bindings();
        this.parseClientPackage();
        this.extraPaths();
        this.database.init();

        configProxy = () => this.config;
        const autoInitComms = this.comms;
        this.init();
    }

    bindings() {
        this.injectScripts = this.injectScripts.bind(this);
        this.ignite = this.ignite.bind(this);
        this.ensureDirectories = this.ensureDirectories.bind(this);
    }

    async init() {
        console.log('[BetterDiscord] init');
        await this.waitForWindowUtils();
        await this.ensureDirectories();

        // TODO
        // this.csseditor = new CSSEditor(this, this.config.getPath('csseditor'));

        this.windowUtils.on('did-finish-load', () => this.injectScripts(true));

        this.windowUtils.on('did-navigate-in-page', (event, url, isMainFrame) => {
            this.windowUtils.send('did-navigate-in-page', { event, url, isMainFrame });
        });

        setTimeout(() => {
            this.injectScripts();
        }, 500);
    }

    async ensureDirectories() {
        await FileUtils.ensureDirectory(this.config.getPath('ext'));
        await Promise.all([
            FileUtils.ensureDirectory(this.config.getPath('plugins')),
            FileUtils.ensureDirectory(this.config.getPath('themes')),
            FileUtils.ensureDirectory(this.config.getPath('modules'))
        ]);
    }

    async waitForWindowUtils() {
        if (this.windowUtils) return this.windowUtils;
        const window = await this.waitForWindow();
        return this.windowUtils = new WindowUtils({ window });
    }

    /**
     * Wait for Discord to load before doing any injection
     */
    async waitForWindow() {
        return new Promise(resolve => {
            const defer = setInterval(() => {
                const windows = OriginalBrowserWindow.getAllWindows();

                if (windows.length === 1 && windows[0].webContents.getURL().includes('discordapp.com')) {
                    resolve(windows[0]);
                    clearInterval(defer);
                }
            }, 10);
        });
    }

    /**
     * Parses the package.json of client script into config
     */
    parseClientPackage() {
        const clientPath = this.config.getPath('client');
        const clientPkg = TESTS ? require(`${path.resolve(clientPath, '..')}/package.json`) :require(`${clientPath}/package.json`);
        const { version } = clientPkg;
        const main = TESTS ? 'betterdiscord.client.js' : clientPkg.main;
        this.config.addPath('client_script', `${clientPath}/${main}`);
        this.config.setClientVersion(version);
        console.log(`[BetterDiscord] Client v${this.config.clientVersion} - ${this.config.getPath('client_script')}`);
    }

    /**
     * Add extra paths to config
     */
    extraPaths() {
        const baseDataPath = path.resolve(this.config.getPath('data'), '..');
        const extPath = path.resolve(baseDataPath, 'ext');
        const pluginPath = path.resolve(extPath, 'plugins');
        const themePath = path.resolve(extPath, 'themes');
        const modulePath = path.resolve(extPath, 'modules');

        this.config.addPath('base', baseDataPath);
        this.config.addPath('ext', extPath);
        this.config.addPath('plugins', pluginPath);
        this.config.addPath('themes', themePath);
        this.config.addPath('modules', modulePath);
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
        console.log(`[BetterDiscord] injecting ${this.config.getPath('client_script')}. Reload: ${reload}`);
        return this.windowUtils.injectScript(this.config.getPath('client_script'));
    }

    /**
     * Patches Electron's BrowserWindow so all windows have Node integration enabled.
     * This needs to be called only once before the main window is created (or BrowserWindow is put in a variable).
     * Basically BetterDiscord needs to load before discord_desktop_core.
     */
    static patchBrowserWindow() {
        console.log('[BetterDiscord] patching BrowserWindow');
        const electron = require('electron');
        const electron_path = require.resolve('electron');
        Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones
        const newElectron = Object.assign({}, electron, { BrowserWindow });
        require.cache[electron_path].exports = newElectron;
    }

    /**
     * Attaches an event handler for HTTP requests to update the Content Security Policy.
     */
    static hookSessionRequest() {
        console.log('[BetterDiscord] hook session request');
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            for (const [header, values] of Object.entries(details.responseHeaders)) {
                if (!header.match(/^Content-Security-Policy(-Report-Only)?$/i)) continue;

                details.responseHeaders[header] = values.map(value => {
                    const policy = new ContentSecurityPolicy(value);
                    for (const [key, value] of Object.entries(CSP)) {
                        if (!policy.get(key)) continue;
                        policy.add(key, value.join(' '));
                    }
                    return policy.toString();
                });
            }

            callback({ responseHeaders: details.responseHeaders });
        });
    }
}

BetterDiscord.patchBrowserWindow();
BetterDiscord.hookSessionRequest();
