/**
 * BetterDiscord Kill Clyde Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import { Reflection } from 'modules';

export default new class KillClyde extends BuiltinModule {

    /* Getters */
    get moduleName() { return 'KillClyde' }

    get settingPath() { return ['ui', 'default', 'kill-clyde'] }

    /* Patches */
    applyPatches() {
        if (this.patches.length) return;
        const { MessageActions } = Reflection.modules;
        this.patch(MessageActions, 'sendBotMessage', () => void 0, 'instead');
    }

}
