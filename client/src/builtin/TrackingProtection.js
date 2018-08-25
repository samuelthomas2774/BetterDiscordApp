/**
 * BetterDiscord Tracking Protection Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';

import { Reflection } from 'modules';

export default new class E2EE extends BuiltinModule {

    /* Getters */
    get moduleName() { return 'TrackingProtection' }

    get settingPath() { return ['security', 'default', 'tracking-protection'] }

    /* Patches */
    applyPatches() {
        if (this.patches.length) return;
        const TrackingModule = Reflection.module.byProps('track');
        if (!TrackingModule) {
            this.warn('Tracking module not found!');
            return;
        }
        this.patch(TrackingModule, 'track', this.track, 'instead');
    }

    track(e) {
        this.debug('Tracking blocked');
    }
}
