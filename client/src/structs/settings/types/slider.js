/**
 * BetterDiscord Slider Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from './basesetting';

export default class SliderSetting extends Setting {

    get defaultValue() {
        return this.min;
    }

    get min() {
        return this.args.min || 0;
    }

    get max() {
        return this.args.max || null;
    }

    get step() {
        return this.args.step || 1;
    }

    get unit() {
        return this.args.unit || '';
    }

    get points() {
        return this.args.points;
    }

}
