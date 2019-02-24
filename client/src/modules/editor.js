/**
 * BetterDiscord Editor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { FileUtils, ClientLogger as Logger, ClientIPC } from 'common';
import Module from './imodule';

export default new class extends Module {

    setInitialState(state) {
        return {
            editorBounds: undefined
        };
    }

    events() {
        ClientIPC.on('editor-runScript', (e, script) => {
            try {
                new Function(script)();
                e.reply('ok');
            } catch (err) {
                e.reply({ err: err.stack || err });
            }
        });
    }

    /**
     * Show editor, flashes if already visible.
     */
    async show() {
        await ClientIPC.send('editor-open', this.state.editorBounds);
    }

}
