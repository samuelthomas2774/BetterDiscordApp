/**
 * BetterDiscord Multiple Choice Option Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Utils } from 'common';

export default class MultipleChoiceOption {

    constructor(args) {
        this.args = args.args || args;

        Object.freeze(this);
    }

    /**
     * This option's ID.
     */
    get id() {
        return this.args.id || this.value;
    }

    /**
     * A string describing this option.
     */
    get text() {
        return this.args.text;
    }

    /**
     * The value to return when this option is active.
     */
    get value() {
        return this.args.value;
    }

}
