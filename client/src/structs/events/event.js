/**
 * BetterDiscord Base Event Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export default class Event {

    constructor(args) {
        this.args = args;

        this.__eventInfo = {
            args: arguments,
            type: this.__eventType
        };
    }

    get event() {
        return this.__eventInfo;
    }

    get __eventType() { return null; }

}
