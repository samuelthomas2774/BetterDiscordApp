/**
 * BetterDiscord Editor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './imodule';
import { DOM } from 'ui';

export default new class extends Module {

    get name() { return 'Editor' }
    get delay() { return false; }

    setInitialState(state) {
        return {
            editorBounds: undefined
        };
    }

    events(ipc) {
        ipc.on('editor-runScript', (e, script) => {
            try {
                new Function(script)();
                e.reply('ok');
            } catch (err) {
                e.reply({ err: err.stack || err });
            }
        });

        ipc.on('editor-injectStyle', (e, { id, style }) => {
            DOM.injectStyle(style, `userstyle-${id}`);
            e.reply('ok');
        });
    }

    /**
     * Show editor, flashes if already visible.
     */
    async show() {
        await this.send('editor-open', this.state.editorBounds);
    }

}
