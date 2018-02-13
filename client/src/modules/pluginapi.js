/**
 * BetterDiscord Plugin Api
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger } from 'common';
import PluginManager from './pluginmanager';
import ThemeManager from './thememanager';
import Events from './events';

export default class PluginApi {

    constructor(pluginInfo) {
        this.pluginInfo = pluginInfo;
    }

    loggerLog(message) { Logger.log(this.pluginInfo.name, message) }
    loggerErr(message) { Logger.err(this.pluginInfo.name, message) }
    loggerWarn(message) { Logger.warn(this.pluginInfo.name, message) }
    loggerInfo(message) { Logger.info(this.pluginInfo.name, message) }
    loggerDbg(message) { Logger.dbg(this.pluginInfo.name, message) }
    get Logger() {
        return {
            log: this.loggerLog.bind(this),
            err: this.loggerErr.bind(this),
            warn: this.loggerWarn.bind(this),
            info: this.loggerInfo.bind(this),
            dbg: this.loggerDbg.bind(this)
        };
    }

    get eventSubs() {
        return this._eventSubs || (this._eventSubs = []);
    }

    eventSubscribe(event, callback) {
        if (this.eventSubs.find(e => e.event === event)) return;
        this.eventSubs.push({
            event,
            callback
        });
        Events.on(event, callback);
    }
    eventUnsubscribe(event) {
        const index = this.eventSubs.findIndex(e => e.event === event);
        if (index < 0) return;
        Events.off(event, this.eventSubs[0].callback);
        this.eventSubs.splice(index, 1);
    }
    eventUnsubscribeAll() {
        this.eventSubs.forEach(event => {
            Events.off(event.event, event.callback);
        });
        this._eventSubs = [];
    }
    get Events() {
        return {
            subscribe: this.eventSubscribe.bind(this),
            unsubscribe: this.eventUnsubscribe.bind(this),
            unsubscribeAll: this.eventUnsubscribeAll.bind(this)
        }
    }

    async getPlugin(plugin_id) {
        // This should require extra permissions
        return await PluginManager.waitForPlugin(plugin_id);
    }
    getPlugins(plugin_id) {
        return PluginManager.localContent.map(plugin => plugin.id);
    }
    get Plugins() {
        return {
            getPlugin: this.getPlugin.bind(this),
            getPlugins: this.getPlugins.bind(this)
        };
    }

    async getTheme(theme_id) {
        // This should require extra permissions
        return await ThemeManager.waitForContent(theme_id);
    }
    getThemes(plugin_id) {
        return ThemeManager.localContent.map(theme => theme.id);
    }
    get Themes() {
        return {
            getTheme: this.getTheme.bind(this),
            getThemes: this.getThemes.bind(this)
        };
    }

    async require(plugin_id) {
        const plugin = await PluginManager.waitForPlugin(plugin_id);
        return plugin.exports;
    }

    import(m) {
        const module = PluginManager.findPlugin(m);
        if (module && module.__require) return module.__require;
        return null;
    }

}
