/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, BdUI, Modals, Reflection } from 'ui';
import { Events, CssEditor, Globals, ExtModuleManager, PluginManager, ThemeManager, ModuleManager, WebpackModules, Settings, Database, DiscordApi, Patcher, ReactComponents, ReactAutoPatcher } from 'modules';
import { Utils, ClientLogger as Logger, ClientIPC } from 'common';
import { EmoteModule } from 'builtin';
import BdCss from './styles/index.scss';
import path from 'path';

const ignoreExternal = false;
const DEV = true;

class BetterDiscord {

    constructor() {
        Logger.file = path.join(__dirname, '..', '..', 'tests', 'log.txt');
        Logger.log('main', 'BetterDiscord starting');

        window.BDDEVMODE = function () {
            if (!DEV) return;
            window._bd = {
                DOM,
                BdUI,
                Modals,
                Reflection,
                Patcher,
                Events,
                CssEditor,
                Globals,
                ExtModuleManager,
                PluginManager,
                ThemeManager,
                ModuleManager,
                WebpackModules,
                Settings,
                Database,
                ReactComponents,
                DiscordApi,
                Logger,
                ClientIPC,
                Utils,
                EmoteModule
            };
        };

        DOM.injectStyle(BdCss, 'bdmain');
        this.globalReady = this.globalReady.bind(this);
        Events.on('global-ready', this.globalReady);
        Globals.initg();
    }

    async init() {
        try {
            await Database.init();
            await Settings.loadSettings();
            await ModuleManager.initModules();

            if (!ignoreExternal) {
                await ExtModuleManager.loadAllModules(true);
                await PluginManager.loadAllPlugins(true);
                await ThemeManager.loadAllThemes(true);
            }

            if (!Settings.get('core', 'advanced', 'ignore-content-manager-errors'))
                Modals.showContentManagerErrors();

            Events.emit('ready');
            Events.emit('discord-ready');
            EmoteModule.observe();
        } catch (err) {
            Logger.err('main', ['FAILED TO LOAD!', err]);
            BdUI.vueInstance.error = err;
        }
    }

    globalReady() {
        BdUI.initUiEvents();
        BdUI.injectUi();
        this.init();
    }

}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let instance;
    Events.on('autopatcher', () => instance = new BetterDiscord());
    ReactAutoPatcher.autoPatch().then(() => Events.emit('autopatcher'));
}
