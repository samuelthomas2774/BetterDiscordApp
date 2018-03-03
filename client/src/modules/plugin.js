/**
 * BetterDiscord Plugin Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, FileUtils } from 'common';
import { Modals } from 'ui';
import { EventEmitter } from 'events';
import PluginManager from './pluginmanager';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';

class PluginEvents {
    constructor(plugin) {
        this.plugin = plugin;
        this.emitter = new EventEmitter();
    }

    on(eventname, callback) {
        this.emitter.on(eventname, callback);
    }

    off(eventname, callback) {
        this.emitter.removeListener(eventname, callback);
    }

    emit(...args) {
        this.emitter.emit(...args);
    }
}

export default class Plugin {

    constructor(pluginInternals) {
        this.__pluginInternals = pluginInternals;
        this.saveSettings = this.saveSettings.bind(this);
        this.hasSettings = this.config && this.config.length > 0;
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.settings.on('setting-updated', event => this.events.emit('setting-updated', event));
        this.settings.on('settings-updated', event => this.events.emit('settings-updated', event));
        this.settings.on('settings-updated', event => this.saveConfiguration());
    }

    get type() { return 'plugin' }
    get configs() { return this.__pluginInternals.configs }
    get info() { return this.__pluginInternals.info }
    get icon() { return this.info.icon }
    get paths() { return this.__pluginInternals.paths }
    get main() { return this.__pluginInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get configSchemes() { return this.configs.schemes }
    get id() { return this.info.id || this.name.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-') }
    get name() { return this.info.name }
    get description() { return this.info.description }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get contentPath() { return this.paths.contentPath }
    get pluginPath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get settings() { return this.userConfig.config }
    get config() { return this.settings.settings }
    get pluginConfig() { return this.config }
    get data() { return this.userConfig.data || (this.userConfig.data = {}) }
    get exports() { return this._exports ? this._exports : (this._exports = this.getExports()) }
    get events() { return this.EventEmitter ? this.EventEmitter : (this.EventEmitter = new PluginEvents(this)) }

    getSetting(setting_id, category_id) {
        for (let category of this.config) {
            if (category_id && category.category !== category_id) continue;
            for (let setting of category.settings) {
                if (setting.id !== setting_id) continue;
                return setting.value;
            }
        }
    }

    showSettingsModal() {
        return Modals.contentSettings(this);
    }

    async saveSettings(newSettings) {
        const updatedSettings = this.settings.merge(newSettings);

        await this.saveConfiguration();
        return updatedSettings;
    }

    async saveConfiguration() {
        try {
            await FileUtils.writeFile(`${this.pluginPath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config: this.settings.strip().settings,
                data: this.data
            }));

			this.settings.setSaved();
        } catch (err) {
			console.error(`Plugin ${this.id} configuration failed to save`, err);
            throw err;
        }
    }

    start(save = true) {
        if (this.onstart && !this.onstart()) return false;
        if (this.onStart && !this.onStart()) return false;

        if (!this.enabled) {
            this.userConfig.enabled = true;
            if (save) this.saveConfiguration();
        }

        return true;
    }

    stop(save = true) {
        if (this.onstop && !this.onstop()) return false;
        if (this.onStop && !this.onStop()) return false;

        if (this.enabled) {
            this.userConfig.enabled = false;
            if (save) this.saveConfiguration();
        }

        return true;
    }

    unload() {
        PluginManager.unloadPlugin(this);
    }

}
