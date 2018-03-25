/**
 * BetterDiscord Error Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Event from './event';

export default class ErrorEvent extends Event {

    constructor(args) {
        super(args);
        this.showStack = false; // For error modal
    }

    /**
     * The module the error occured in.
     */
    get module() {
        return this.args.module;
    }

    /**
     * A message describing the error.
     */
    get message() {
        return this.args.message;
    }

    /**
     * The original error object.
     */
    get err() {
        return this.args.err;
    }

    /**
     * A trace showing which functions were called when the error occured.
     */
    get stackTrace() {
        return this.err.stack;
    }

    /**
     * The type of event.
     */
    get __eventType() {
        return 'error';
    }

}
