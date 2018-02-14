/**
 * BetterDiscord Modals
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils, FileUtils } from 'common';
import { Events, PluginManager, ThemeManager } from 'modules';
import BasicModal from './components/bd/modals/BasicModal.vue';
import ErrorModal from './components/bd/modals/ErrorModal.vue';
import SettingsModal from './components/bd/modals/SettingsModal.vue';

export default class {

    static add(modal, component) {
        modal.component = modal.component || {
            template: '<custom-modal :modal="modal" />',
            components: { 'custom-modal': component },
            data() { return { modal }; },
            created() { modal.vue = this; }
        };
        modal.closing = false;
        modal.close = () => this.close(modal);

        this.stack.push(modal);
        Events.emit('bd-refresh-modals');
        return modal;
    }

    static close(modal) {
        return new Promise((resolve, reject) => {
            modal.closing = true;
            setTimeout(() => {
                this._stack = this.stack.filter(m => m !== modal);
                Events.emit('bd-refresh-modals');
                resolve();
            }, 200);
        });
    }

    static closeAll() {
        for (let modal of this.stack)
            modal.close();
    }

    static closeLast() {
        if (!this.stack.length) return;
        this.stack[this.stack.length - 1].close();
    }

    static basic(title, text) {
        return this.add({ title, text }, BasicModal);
    }

    static error(event) {
        return this.add({ event }, ErrorModal);
    }

    static showContentManagerErrors() {
        // Get any errors from PluginManager and ThemeManager
        this.error({
            header:
                (PluginManager.errors.length && ThemeManager.errors.length ? '' :
                (PluginManager.errors.length ? PluginManager.moduleName : ThemeManager.moduleName) + ' - ') +
                (PluginManager.errors.length ? `${PluginManager.errors.length} ${PluginManager.contentType}${PluginManager.errors.length !== 1 ? 's' : ''}` : '') +
                (PluginManager.errors.length && ThemeManager.errors.length ? ' and ' : '') +
                (ThemeManager.errors.length ? `${ThemeManager.errors.length} ${ThemeManager.contentType}${ThemeManager.errors.length !== 1 ? 's' : ''}` : '') +
                ' failed to load',
            module: (PluginManager.errors.length && ThemeManager.errors.length ? 'Content Manager' :
                    (PluginManager.errors.length ? PluginManager.moduleName : ThemeManager.moduleName)),
            type: 'err',
            content: ([]).concat(PluginManager.errors).concat(ThemeManager.errors)
        });
    }

    static settings(headertext, settings, settingsUpdated, settingUpdated, saveSettings) {
        return this.add({
            headertext, settings,
            saveSettings: saveSettings ? saveSettings : newSettings => {
                const updatedSettings = [];

                for (let newCategory of newSettings) {
                    let category = settings.find(c => c.category === newCategory.category);

                    for (let newSetting of newCategory.settings) {
                        let setting = category.settings.find(s => s.id === newSetting.id);
                        if (Utils.compare(setting.value, newSetting.value)) continue;

                        let old_value = setting.value;
                        setting.value = newSetting.value;
                        updatedSettings.push({ category_id: category.category, setting_id: setting.id, value: setting.value, old_value });
                        if (settingUpdated) settingUpdated(category.category, setting.id, setting.value, old_value);
                    }
                }

                return settingsUpdated ? settingsUpdated(updatedSettings) : updatedSettings;
            }
        }, SettingsModal);
    }

    static pluginSettings(plugin) {
        // return this.add({ headertext: plugin.name + ' Settings', settings: plugin.config, saveSettings: plugin.saveSettings }, SettingsModal);
        return this.settings(plugin.name + ' Settings', plugin.config, null, null, plugin.saveSettings.bind(plugin));
    }

    static themeSettings(theme) {
        // return this.add({ headertext: theme.name + ' Settings', settings: theme.config, saveSettings: theme.saveSettings }, SettingsModal);
        return this.settings(theme.name + ' Settings', theme.themeConfig, null, null, theme.saveSettings.bind(theme));
    }

    static get stack() {
        return this._stack ? this._stack : (this._stack = []);
    }

}
