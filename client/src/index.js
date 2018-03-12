/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, BdUI, Modals } from 'ui';
import { Events, CssEditor, Globals, ExtModuleManager, PluginManager, ThemeManager, ModuleManager, WebpackModules, Settings, Database } from 'modules';
import { ClientLogger as Logger, ClientIPC } from 'common';
import { EmoteModule } from 'builtin';
import BdCss from './styles/index.scss';

const ignoreExternal = false;

class BetterDiscord {

    constructor() {
        window.bddb = Database;
        window.bdglobals = Globals;
        window.ClientIPC = ClientIPC;
        window.css = CssEditor;
        window.pm = PluginManager;
        window.tm = ThemeManager;
        window.events = Events;
        window.wpm = WebpackModules;
        window.bdsettings = Settings;
        window.bdmodals = Modals;
        window.bdlogs = Logger;
        window.emotes = EmoteModule;
        window.dom = DOM;

        DOM.injectStyle(BdCss, 'bdmain');
        Events.on('global-ready', this.globalReady.bind(this));
    }

    async init() {
        try {
            throw new Error('Test');

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
    let bdInstance = window.bdInstance = new BetterDiscord();
}
