/**
 * BetterDiscord Number Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from './basesetting';

export default class NumberSetting extends Setting {

    /**
     * The current value.
     */
    get value() {
        return this.args.value * this.multi;
    }

    set value(value) {
        this.setValue(value / this.multi);
    }

    /**
     * A number to multiply the value by.
     */
    get multi() {
        return this.args.multi || 1;
    }

}
