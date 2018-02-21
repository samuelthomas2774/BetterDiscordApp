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
import { Settings, Events, PluginManager, ThemeManager } from 'modules';
import BasicModal from './components/bd/modals/BasicModal.vue';
import ConfirmModal from './components/bd/modals/ConfirmModal.vue';
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
        modal.close = force => this.close(modal, force);
        modal.id = Date.now();

        this.stack.push(modal);
        Events.emit('bd-refresh-modals');
        return modal;
    }

    static close(modal, force) {
        return new Promise(async (resolve, reject) => {
            if (modal.beforeClose) {
                try {
                    let beforeCloseResult = modal.beforeClose(force);
                    if (beforeCloseResult instanceof Promise)
                        beforeCloseResult = await beforeCloseResult;

                    if (beforeCloseResult && !force) return reject(beforeCloseResult);
                } catch (err) {
                    if (!force) return reject(err);
                }
            }

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

    static confirm(title, text) {
        const modal = { title, text };
        const promise = new Promise((resolve, reject) => {
            modal.confirm = () => resolve(true);
            modal.beforeClose = () => reject();
            this.add(modal, ConfirmModal);
        });
        modal.promise = promise;
        return modal;
    }

    static error(event) {
        return this.add({ event }, ErrorModal);
    }

    static showContentManagerErrors(clear = true) {
        // Get any errors from PluginManager and ThemeManager
        const errors = ([]).concat(PluginManager.errors).concat(ThemeManager.errors);
        if (errors.length) {
            const modal = this.error({
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
                content: errors
            });

            if (clear) {
                PluginManager._errors = [];
                ThemeManager._errors = [];
            }

			return modal;
        }
    }

    static settings(headertext, settings, schemes, settingsUpdated, settingUpdated, saveSettings) {
        return this.add({
            headertext, settings, schemes,
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

    static internalSettings(set_id) {
        const set = Settings.getSet(set_id);
        if (!set) return;
        return this.settings(set.headertext, set.settings, set.schemes, null, null, newSettings => Settings.mergeSettings(set.id, newSettings));
    }

    static contentSettings(content) {
        return this.settings(content.name + ' Settings', content.config, content.configSchemes, null, null, content.saveSettings.bind(content));
    }

    static get stack() {
        return this._stack ? this._stack : (this._stack = []);
    }

}
