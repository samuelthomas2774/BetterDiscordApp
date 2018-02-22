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
import ContentConfig from './contentconfig';
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
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get contentPath() { return this.paths.contentPath }
    get pluginPath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get config() { return this.userConfig.config || [] }
    get pluginConfig() { return this.config }
    get exports() { return this._exports ? this._exports : (this._exports = this.getExports()) }
    get events() { return this.EventEmitter ? this.EventEmitter : (this.EventEmitter = new PluginEvents(this)) }

    getSetting(setting_id, category_id) {
        for (let category of this.config) {
            if (category_id && category.category !== category_id) return;
            for (let setting of category.settings) {
                if (setting.id !== setting_id) return;
                return setting.value;
            }
        }
    }

    showSettingsModal() {
        return Modals.contentSettings(this);
    }

    async saveSettings(newSettings) {
        const updatedSettings = [];

        for (let newCategory of newSettings) {
            const category = this.config.find(c => c.category === newCategory.category);
            for (let newSetting of newCategory.settings) {
                const setting = category.settings.find(s => s.id === newSetting.id);
                if (Utils.compare(setting.value, newSetting.value)) continue;

                const old_value = setting.value;
                setting.value = newSetting.value;
                updatedSettings.push({ category_id: category.category, setting_id: setting.id, value: setting.value, old_value });
                this.settingUpdated(category.category, setting.id, setting.value, old_value);
            }
        }

        this.saveConfiguration();
        return this.settingsUpdated(updatedSettings);
    }

    settingUpdated(category_id, setting_id, value, old_value) {
        const event = new SettingUpdatedEvent({ category_id, setting_id, value, old_value });
        this.events.emit('setting-updated', event);
        this.events.emit(`setting-updated_{$category_id}_${setting_id}`, event);
    }

    settingsUpdated(updatedSettings) {
        const event = new SettingsUpdatedEvent({ settings: updatedSettings.map(s => new SettingUpdatedEvent(s)) });
        this.events.emit('settings-updated', event);
    }

    async saveConfiguration() {
        window.testConfig = new ContentConfig(this.config);
        try {
            const config = new ContentConfig(this.config).strip();
            await FileUtils.writeFile(`${this.pluginPath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config
            }));
        } catch (err) {
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
