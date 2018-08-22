/**
 * BetterDiscord Voice Disconnect Timestamps Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import { WebpackModules } from 'modules';

export default new class VoiceDisconnect extends BuiltinModule {

    get settingPath() {
        return ['core', 'default', 'voice-disconnect'];
    }

    async enabled(e) {
        window.addEventListener('beforeunload', this.listener);
    }

    listener() {
        const VoiceChannelActions = WebpackModules.getModuleByName('VoiceChannelActions');
        VoiceChannelActions.selectVoiceChannel(null, null);
    }

    disabled(e) {
        window.removeEventListener('beforeunload', this.listener);
    }

}
