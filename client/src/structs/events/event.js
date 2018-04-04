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
        this.__eventInfo = {
            args: arguments,
            type: this.__eventType
        };
    }

    /**
     * An object containing information about the event.
     */
    get event() {
        return this.__eventInfo;
    }

    /**
     * Extra data associated with this event.
     */
    get data() {
        return this.args.data;
    }

    /**
     * The first argument that was passed to the constructor, which contains information about the event.
     */
    get args() {
        return this.event.args[0];
    }

    /**
     * The type of event.
     */
    get __eventType() { return undefined; }

}
