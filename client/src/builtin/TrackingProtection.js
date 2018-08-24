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

import { Patcher, MonkeyPatch, Reflection } from 'modules';

export default new class E2EE extends BuiltinModule {

    get settingPath() {
        return ['security', 'default', 'tracking-protection'];
    }

    track(e) {
        // console.log('Blocked Tracking');
    }

    enabled(e) {
        if (Patcher.getPatchesByCaller('BD:TrackingProtection').length) return;
        const trackingModule = Reflection.module.byProps('track');
        if (!trackingModule) return; // TODO Log it
        MonkeyPatch('BD:TrackingProtection', trackingModule).instead('track', this.track);
    }

    disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:TrackingProtection')) patch.unpatch();
    }

}
