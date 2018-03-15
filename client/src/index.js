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
import BdCss from './styles/index.scss';
import { Patcher, Vendor, Events, CssEditor, Globals, ExtModuleManager, PluginManager, ThemeManager, ModuleManager, WebpackModules, Settings, Database, ReactComponents, ReactAutoPatcher, DiscordApi } from 'modules';
import { ClientLogger as Logger, ClientIPC, Utils } from 'common';
import { EmoteModule } from 'builtin';
const ignoreExternal = false;
const DEV = true;

class BetterDiscord {

    constructor() {
        window.BDDEVMODE = function () {
            if (!DEV) return null;
            return window._bd = {
                DOM,
                BdUI,
                Modals,
                Reflection,
                Patcher,
                Vendor,
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
            }
        }

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
            Modals.showContentManagerErrors();
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
        }
    }

    globalReady() {
        BdUI.initUiEvents();
        this.vueInstance = BdUI.injectUi();
        this.init();
    }
}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let instance = null;
    // eslint-disable-next-line no-inner-declarations
    function init() {
        instance = new BetterDiscord();
    }
    Events.on('autopatcher', init);
    ReactAutoPatcher.autoPatch().then(() => Events.emit('autopatcher'));
}
