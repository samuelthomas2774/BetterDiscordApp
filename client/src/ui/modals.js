/**
 * BetterDiscord Modals
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { FileUtils } from 'common';
import { Events, PluginManager, ThemeManager } from 'modules';
import BasicModal from './components/bd/modals/BasicModal.vue';
import ErrorModal from './components/bd/modals/ErrorModal.vue';
import PluginSettingsModal from './components/bd/modals/PluginSettingsModal.vue';
import ThemeSettingsModal from './components/bd/modals/ThemeSettingsModal.vue';

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

    static pluginSettings(plugin) {
        return this.add({ plugin }, PluginSettingsModal);
    }

    static themeSettings(theme) {
        return this.add({ theme }, ThemeSettingsModal);
    }

    static get stack() {
        return this._stack ? this._stack : (this._stack = []);
    }

}
