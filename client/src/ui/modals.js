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
import PermissionModal from './components/bd/modals/PermissionModal.vue';

export default class {

    static add(modal, component) {
        modal.component = modal.component || {
            template: '<custom-modal :modal="modal" />',
            components: { 'custom-modal': component },
            data() { return { modal }; },
            created() {
                modal.vueInstance = this;
                modal.vue = this.$children[0];
            }
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
                    const beforeCloseResult = await modal.beforeClose(force);
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
        modal.promise = new Promise((resolve, reject) => {
            modal.confirm = () => resolve(true);
            modal.beforeClose = () => reject();
            this.add(modal, ConfirmModal);
        });
        return modal;
    }

    static permissions(title, name, perms) {
        const modal = { title, name, perms };
        modal.promise = new Promise((resolve, reject) => {
            modal.confirm = () => resolve(true);
            modal.beforeClose = () => reject();
            this.add(modal, PermissionModal);
        });
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

    static settings(settingsset, headertext, options) {
        return this.add(Object.assign({
            headertext: headertext ? headertext : settingsset.headertext,
            settings: settingsset,
            schemes: settingsset.schemes
        }, options), SettingsModal);
    }

    static internalSettings(set_id) {
        const set = Settings.getSet(set_id);
        if (!set) return;
        return this.settings(set, set.headertext);
    }

    static contentSettings(content) {
        return this.settings(content.settings, content.name + ' Settings');
    }

    static get stack() {
        return this._stack ? this._stack : (this._stack = []);
    }

}
