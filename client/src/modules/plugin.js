/**
 * BetterDiscord Plugin Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { FileUtils } from 'common';

export default class {

    constructor(pluginInternals) {
        this.__pluginInternals = pluginInternals;
        this.saveSettings = this.saveSettings.bind(this);
        this.hasSettings = this.pluginConfig && this.pluginConfig.length > 0;
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
    get id() { return this.info.id || this.info.name.replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-') }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get pluginPath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get pluginConfig() { return this.userConfig.config || [] }
    get exports() { return this._exports ? this._exports : (this._exports = this.getExports()) }

    getSetting(setting_id, category_id) {
        for (let category of this.pluginConfig) {
            if (category_id && category.category !== category_id) return;
            for (let setting of category.settings) {
                if (setting.id !== setting_id) return;
                return setting.value;
            }
        }
    }

    async saveSettings(newSettings) {
        for (let category of newSettings) {
            const oldCategory = this.pluginConfig.find(c => c.category === category.category);
            for (let setting of category.settings) {
                const oldSetting = oldCategory.settings.find(s => s.id === setting.id);
                if (oldSetting.value === setting.value) continue;
                oldSetting.value = setting.value;
                if (this.settingChanged) this.settingChanged(category.category, setting.id, setting.value);
            }
        }

        this.saveConfiguration();

        if (this.settingsChanged) this.settingsChanged(this.pluginConfig);

        return this.pluginConfig;
    }

    async saveConfiguration() {
        try {
            await FileUtils.writeFile(`${this.pluginPath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config: this.pluginConfig.map(category => {
                    return {
                        category: category.category,
                        settings: category.settings.map(setting => {
                            return {
                                id: setting.id,
                                value: setting.value
                            };
                        })
                    };
                })
            }));
        } catch (err) {
            throw err;
        }
    }

    start() {
        if (this.onstart && !this.onstart()) return false;
        if (this.onStart && !this.onStart()) return false;

        if (!this.enabled) {
            this.userConfig.enabled = true;
            this.saveConfiguration();
        }

        return true;
    }

    stop() {
        if (this.onstop && !this.onstop()) return false;
        if (this.onStop && !this.onStop()) return false;

        this.userConfig.enabled = false;
        this.saveConfiguration();
        return true;
    }

}
