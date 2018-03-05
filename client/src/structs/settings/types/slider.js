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
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return this.min;
    }

    /**
     * The smallest number the user may select.
     */
    get min() {
        return this.args.min || 0;
    }

    /**
     * The largest number the user may select.
     */
    get max() {
        return this.args.max || null;
    }

    /**
     * How much the user may change the value at once by moving the slider.
     */
    get step() {
        return this.args.step || 1;
    }

    /**
     * A string that will be displayed with the value.
     */
    get unit() {
        return this.args.unit || '';
    }

    /**
     * A number to multiply the value by.
     */
    get multi() {
        return this.args.multi || 1;
    }

    /**
     * An object mapping points on the slider to labels.
     */
    get points() {
        return this.args.points;
    }

}
