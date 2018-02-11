/**
 * BetterDiscord Theme Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';
import { DOM } from 'ui';
import { FileUtils, ClientIPC } from 'common';

class Theme {

    constructor(themeInternals) {
        this.__themeInternals = themeInternals;
        this.hasSettings = this.themeConfig && this.themeConfig.length > 0;
        this.saveSettings = this.saveSettings.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
    }

    get configs() { return this.__themeInternals.configs }
    get info() { return this.__themeInternals.info }
    get icon() { return this.info.icon }
    get paths() { return this.__themeInternals.paths }
    get main() { return this.__themeInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get themePath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get themeConfig() { return this.userConfig.config }
    get css() { return this.__themeInternals.css }
    get id() { return this.name.toLowerCase().replace(/\s+/g, '-') }

    async saveSettings(newSettings) {
        if (newSettings) {
            for (let category of newSettings) {
                const oldCategory = this.themeConfig.find(c => c.category === category.category);
                for (let setting of category.settings) {
                    const oldSetting = oldCategory.settings.find(s => s.id === setting.id);
                    if (oldSetting.value === setting.value) continue;
                    oldSetting.value = setting.value;
                    if (this.settingChanged) this.settingChanged(category.category, setting.id, setting.value);
                }
            }
        }

        try {
            await FileUtils.writeFile(`${this.themePath}/user.config.json`, JSON.stringify({ enabled: this.enabled, config: this.themeConfig }));
        } catch (err) {
            throw err;
        }

        if (this.settingsChanged) this.settingsChanged(this.themeConfig);

        return this.pluginConfig;
    }

    enable() {
        this.userConfig.enabled = true;
        this.saveSettings();
        DOM.injectTheme(this.css, this.id);
    }

    disable() {
        this.userConfig.enabled = false;
        this.saveSettings();
        DOM.deleteTheme(this.id);
    }

}

export default class extends ContentManager {

    static get localThemes() {
        return this.localContent;
    }

    static get pathId() {
        return 'themes';
    }

    static get loadAllThemes() {
        return this.loadAllContent;
    }

    static get loadContent() { return this.loadTheme }
    static async loadTheme(paths, configs, info, main) {
        try {
            let css = '';
            if (info.type === 'sass') {
                css = await ClientIPC.send('bd-compileSass', { path: paths.mainPath });
            } else {
                css = await FileUtils.readFile(paths.mainPath);
            }
            const instance = new Theme({ configs, info, main, paths: { contentPath: paths.contentPath, dirName: paths.dirName }, css });
            if (instance.enabled) instance.enable();
            return instance;
        } catch (err) {
            throw err;
        }
    }

    static enableTheme(theme) {
        theme.enable();
    }

    static disableTheme(theme) {
        theme.disable();
    }

}
