/**
 * BetterDiscord Theme Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ThemeManager from './thememanager';
import { EventEmitter } from 'events';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';
import { DOM, Modals } from 'ui';
import { Utils, FileUtils, ClientIPC } from 'common';
import ContentConfig from './contentconfig';

class ThemeEvents {
    constructor(theme) {
        this.theme = theme;
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

export default class Theme {

    constructor(themeInternals) {
        this.__themeInternals = themeInternals;
        this.hasSettings = this.config && this.config.length > 0;
        this.saveSettings = this.saveSettings.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
    }

    get configs() { return this.__themeInternals.configs }
    get info() { return this.__themeInternals.info }
    get icon() { return this.info.icon }
    get paths() { return this.__themeInternals.paths }
    get main() { return this.__themeInternals.main }
    get loaded() { return this.__themeInternals.loaded }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get configSchemes() { return this.configs.schemes }
    get id() { return this.info.id || this.name.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-').replace(/\s+/g, '-') }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get contentPath() { return this.paths.contentPath }
    get themePath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get config() { return this.userConfig.config || [] }
    get themeConfig() { return this.config }
    get css() { return this.userConfig.css }
    get events() { return this.EventEmitter ? this.EventEmitter : (this.EventEmitter = new ThemeEvents(this)) }

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

        // As the theme's configuration has changed it needs recompiling
        // When the compiled CSS has been save it will also save the configuration
        await this.recompile();

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
        try {
            const config = new ContentConfig(this.config).strip();
            await FileUtils.writeFile(`${this.themePath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config,
                css: this.css
            }));
        } catch (err) {
            throw err;
        }
    }

    enable(save = true) {
        if (!this.enabled) {
            this.userConfig.enabled = true;
            if (save) this.saveConfiguration();
        }
        DOM.injectTheme(this.css, this.id);
    }

    disable(save = true) {
        this.userConfig.enabled = false;
        if (save) this.saveConfiguration();
        DOM.deleteTheme(this.id);
    }

    async compile() {
        console.log('Compiling CSS');

        let css = '';
        if (this.info.type === 'sass') {
            css = await ClientIPC.send('bd-compileSass', {
                data: await ThemeManager.getConfigAsSCSS(this.config),
                path: this.paths.mainPath.replace(/\\/g, '/')
            });
            console.log(css);
        } else {
            css = await FileUtils.readFile(this.paths.mainPath);
        }

        return css;
    }

    async recompile() {
        const css = await this.compile();
        this.userConfig.css = css;

        await this.saveConfiguration();

        if (this.enabled) {
            DOM.deleteTheme(this.id);
            DOM.injectTheme(this.css, this.id);
        }
    }

}
