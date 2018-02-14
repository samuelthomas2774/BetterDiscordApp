/**
 * BetterDiscord CSS Editor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientIPC } from 'common';
import Settings from './settings';
import { DOM } from 'ui';

/**
 * Custom css editor communications
 */
export default class {

    /**
     * Init css editor
     */
    static init() {
        ClientIPC.on('bd-get-scss', () => this.sendToEditor('set-scss', { scss: this.scss }));
        ClientIPC.on('bd-update-scss', (e, scss) => this.updateScss(scss));
        ClientIPC.on('bd-save-csseditor-bounds', (e, bounds) => this.saveEditorBounds(bounds));

        ClientIPC.on('bd-save-scss', async (e, scss) => {
            await this.updateScss(scss);
            await this.save();
        });
    }

    /**
     * Show css editor, flashes if already visible
     */
    static async show() {
        await ClientIPC.send('openCssEditor', this.editor_bounds);
    }

    /**
     * Update css in client
     * @param {String} scss scss to compile
     * @param {bool} sendSource send to css editor instance
     */
    static updateScss(scss, sendSource) {
        if (sendSource)
            this.sendToEditor('set-scss', { scss });

        return new Promise((resolve, reject) => {
            this.compile(scss).then(css => {
                this.css = css;
                this._scss = scss;
                this.sendToEditor('scss-error', null);
                resolve();
            }).catch(err => {
                this.sendToEditor('scss-error', err);
                reject(err);
            });
        });
    }

    /**
     * Save css to file
     */
    static async save() {
        Settings.saveSettings();
    }

    /**
     * Save current editor bounds
     * @param {Rectangle} bounds editor bounds
     */
    static saveEditorBounds(bounds) {
        this.editor_bounds = bounds;
        Settings.saveSettings();
    }

    /**
     * Send scss to core for compilation
     * @param {String} scss scss string
     */
    static async compile(scss) {
        return await ClientIPC.send('bd-compileSass', { data: scss });
    }

    /**
     * Send css to open editor
     * @param {any} channel
     * @param {any} data
     */
    static async sendToEditor(channel, data) {
        return await ClientIPC.send('sendToCssEditor', { channel, data });
    }

    /**
     * Current uncompiled scss
     */
    static get scss() {
        return this._scss || '';
    }

    /**
     * Set current scss
     */
    static set scss(scss) {
        this.updateScss(scss, true);
    }

    /**
     * Inject compiled css to head
     * {DOM}
     */
    static set css(css) {
        DOM.injectStyle(css, 'bd-customcss');
    }

}
