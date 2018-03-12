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
import { Patcher, Events, CssEditor, Globals, ExtModuleManager, PluginManager, ThemeManager, ModuleManager, WebpackModules, Settings, Database, ReactComponents, DiscordApi } from 'modules';
import { ClientLogger as Logger, ClientIPC, Utils } from 'common';
import { EmoteModule } from 'builtin';
const ignoreExternal = true;

class BetterDiscord {

    constructor() {
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
    function init() {
        instance = new BetterDiscord();
    }

    window.Patcher = Patcher;
    Events.on('react-ensure', init);
    function ensureReact() {
        if (!window.webpackJsonp || !WebpackModules.getModuleByName('React')) return setTimeout(ensureReact, 10);
        ReactComponents.getComponent('Message').then(Message => {
            Events.emit('react-ensure');
            Message.patchRender([{
                selector: '.message',
                method: 'replace',
                fn: function (item) {
                    if (!this.props || !this.props.message) return item;
                    const { message } = this.props;
                    const { id, colorString, bot, author, attachments, embeds } = message;
                    item.props['data-message-id'] = id;
                    item.props['data-colourstring'] = colorString;
                    if (bot || (author && author.bot)) item.props.className += ' bd-isBot';
                    if (attachments && attachments.length) item.props.className += ' bd-hasAttachments';
                    if (embeds && embeds.length) item.props.className += ' bd-hasEmbeds';
                    if (author && author.id === DiscordApi.currentUser.id) item.props.className += ' bd-isCurrentUser';
                    return item;
                }
            }]);
        });
        Patcher.superpatch('React', 'createElement', function (component, retVal) {
            if (!component.displayName) return;
            ReactComponents.push(component, retVal);
        });
    }
    ensureReact();
}
