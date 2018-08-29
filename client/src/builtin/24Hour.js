/**
 * BetterDiscord 24 Hour Timestamps Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import { Reflection } from 'modules';

const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);

export default new class TwentyFourHour extends BuiltinModule {

    /* Getters */
    get moduleName() { return 'TwentyFourHour' }

    get settingPath() { return ['ui', 'default', '24-hour'] }

    /* Patches */
    applyPatches() {
        if (this.patches.length) return;
        const { TimeFormatter } = Reflection.modules;
        this.patch(TimeFormatter, 'calendarFormat', this.convertTimeStamps);
    }

    /**
     * Convert 12 hours timestamps to 24 hour timestamps
     */
    convertTimeStamps(that, args, returnValue) {
        const matched = returnValue.match(twelveHour);
        if (!matched || matched.length !== 4) return;
        if (matched[3] === 'AM') return returnValue.replace(matched[0], `${matched[1] === '12' ? '00' : matched[1].padStart(2, '0')}:${matched[2]}`)
        return returnValue.replace(matched[0], `${parseInt(matched[1]) + 12}:${matched[2]}`)
    }

}
