/**
 * BetterDiscord Theme Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Settings from './settings';
import ThemeManager from './thememanager';
import { EventEmitter } from 'events';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';
import { DOM, Modals } from 'ui';
import { Utils, FileUtils, ClientIPC, ClientLogger as Logger, AsyncEventEmitter } from 'common';
import filewatcher from 'filewatcher';

export default class Theme {

    constructor(themeInternals) {
        this.__themeInternals = themeInternals;
        this.hasSettings = this.config && this.config.length > 0;
        this.saveConfiguration = this.saveConfiguration.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);

        this.settings.on('setting-updated', event => this.events.emit('setting-updated', event));
        this.settings.on('settings-updated', event => this.events.emit('settings-updated', event));
        this.settings.on('settings-updated', event => this.recompile());

        const watchfiles = Settings.getSetting('css', 'default', 'watch-files');
        if (watchfiles.value) this.watchfiles = this.files;
        watchfiles.on('setting-updated', event => {
            if (event.value) this.watchfiles = this.files;
            else this.watchfiles = [];
        });
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
    get data() { return this.userConfig.data || (this.userConfig.data = {}) }
    get css() { return this.data.css }
    get events() { return this.EventEmitter ? this.EventEmitter : (this.EventEmitter = new AsyncEventEmitter()) }

    showSettingsModal() {
        return Modals.contentSettings(this);
    }

    async saveConfiguration() {
        try {
            await FileUtils.writeFile(`${this.themePath}/user.config.json`, JSON.stringify({
                enabled: this.enabled,
                config: this.settings.strip().settings,
                data: this.data
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

        if (this.info.type === 'sass') {
            const config = await ThemeManager.getConfigAsSCSS(this.settings);

            const result = await ClientIPC.send('bd-compileSass', {
                data: config,
                path: this.paths.mainPath.replace(/\\/g, '/')
            });

            Logger.log(this.name, ['Finished compiling theme', new class Info {
                get SCSS_variables() { console.log(config); }
                get Compiled_SCSS() { console.log(result.css.toString()); }
				get Result() { console.log(result); }
            }]);

            return {
                css: result.css.toString(),
                files: result.stats.includedFiles
            };
        } else {
            return {
                css: FileUtils.readFile(this.paths.mainPath)
            };
        }
    }

    async recompile() {
        const data = await this.compile();
        this.data.css = data.css;
        this.files = data.files;

        await this.saveConfiguration();

        if (this.enabled) {
            DOM.deleteTheme(this.id);
            DOM.injectTheme(this.css, this.id);
        }
    }

    /**
     * An array of files that are imported in custom CSS.
     * @return {Array} Files being watched
     */
    get files() {
        return this.data.files || (this.data.files = []);
    }

    /**
     * Sets all files that are imported in custom CSS.
     * @param {Array} files Files to watch
     */
    set files(files) {
        this.data.files = files;
        if (Settings.get('css', 'default', 'watch-files'))
            this.watchfiles = files;
    }

    /**
     * A filewatcher instance.
     */
    get filewatcher() {
        if (this._filewatcher) return this._filewatcher;
        this._filewatcher = filewatcher();
        this._filewatcher.on('change', (file, stat) => {
            // Recompile SCSS
            this.recompile();
        });
        return this._filewatcher;
    }

    /**
     * An array of files that are being watched for changes.
     * @return {Array} Files being watched
     */
    get watchfiles() {
        return this._watchfiles || (this._watchfiles = []);
    }

    /**
     * Sets all files to be watched.
     * @param {Array} files Files to watch
     */
    set watchfiles(files) {
        for (let file of files) {
            if (!this.watchfiles.includes(file)) {
                this.filewatcher.add(file);
                this.watchfiles.push(file);
                Logger.log(this.name, `Watching file ${file} for changes`);
            }
        }

        for (let index in this.watchfiles) {
            let file = this.watchfiles[index];
            while (file && !files.find(f => f === file)) {
                this.filewatcher.remove(file);
                this.watchfiles.splice(index, 1);
                Logger.log(this.name, `No longer watching file ${file} for changes`);
                file = this.watchfiles[index];
            }
        }
    }

}
