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
import { Utils, FileUtils, ClientIPC, ClientLogger as Logger } from 'common';

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

        this.settings.on('setting-updated', event => this.events.emit('setting-updated', event));
        this.settings.on('settings-updated', event => this.events.emit('settings-updated', event));
        this.settings.on('settings-updated', event => this.saveConfiguration());
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
    get description() { return this.info.description }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get contentPath() { return this.paths.contentPath }
    get themePath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get settings() { return this.userConfig.config }
    get config() { return this.settings.settings }
    get themeConfig() { return this.config }
    get css() { return this.userConfig.css }
    get events() { return this.EventEmitter ? this.EventEmitter : (this.EventEmitter = new ThemeEvents(this)) }

    showSettingsModal() {
        return Modals.contentSettings(this);
    }

    async saveSettings(newSettings) {
        const updatedSettings = this.settings.merge(newSettings);

        // As the theme's configuration has changed it needs recompiling
        // When the compiled CSS has been saved it will also save the configuration
        await this.recompile();

        return this.settingsUpdated(updatedSettings);
    }

    async saveConfiguration() {
        try {
            await FileUtils.writeFile(`${this.themePath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config: this.settings.strip().settings,
                css: this.css
            }));

            this.settings.setSaved();
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
            const config = await ThemeManager.getConfigAsSCSS(this.settings);

            css = await ClientIPC.send('bd-compileSass', {
                data: config,
                path: this.paths.mainPath.replace(/\\/g, '/')
            });

            Logger.log(this.name, ['Finished compiling theme', new class Info {
                get SCSS_variables() { console.log(config); }
                get Compiled_SCSS() { console.log(css); }
            }]);
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
