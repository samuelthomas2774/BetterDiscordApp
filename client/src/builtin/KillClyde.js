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
import { Patcher, MonkeyPatch, Reflection } from 'modules';

export default new class KillClyde extends BuiltinModule {

    get settingPath() {
        return ['ui', 'default', 'kill-clyde'];
    }

    async enabled(e) {
        if (Patcher.getPatchesByCaller('BD:KillClyde').length) return;
        const { MessageActions } = Reflection.modules;
        MonkeyPatch('BD:KillClyde', MessageActions).instead('sendBotMessage', void 0);
    }

    disabled(e) {
        Patcher.unpatchAll('BD:KillClyde');
    }

}
