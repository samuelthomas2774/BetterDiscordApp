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
import { DOM } from 'ui';

export default class {

    static init() {
        ClientIPC.on('bd-get-scss', () => this.sendToEditor('set-scss', { scss: this.scss }));
        ClientIPC.on('bd-update-scss', (e, scss) => this.updateScss(scss));

        ClientIPC.on('bd-save-scss', async (e, scss) => {
            this.updateScss(scss);
            e.reply(await this.save(scss));
        });
    }

    static async show() {
        await ClientIPC.send('openCssEditor', {});
    }

    static updateScss(scss) {
        this.compile(scss).then(css => {
            this.css = css;
            this._scss = scss;
            this.sendToEditor('scss-error', null);
        }).catch(err => {
            this.sendToEditor('scss-error', err);
        });
    }

    static async save(scss) {
        console.log('Saving SCSS:', scss);
    }

    static async compile(scss) {
        return await ClientIPC.send('bd-compileSass', { data: scss });
    }

    static async sendToEditor(channel, data) {
        return await ClientIPC.send('sendToCssEditor', { channel, data });
    }

    static get scss() {
        return this._scss || '';
    }

    static set scss(scss) {
        this.sendToEditor('set-scss', { scss: this.scss });
        this.updateScss(scss);
    }

    static set css(css) {
        DOM.injectStyle(css, 'bd-customcss');
    }

}
