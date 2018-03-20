/**
 * BetterDiscord Events Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EventEmitter } from 'events';
const emitter = new EventEmitter();

export default class {

    /**
     * Adds an event listener.
     * @param {String} event The event to listen for
     * @param {Function} callback The function to call when the event is emitted
     */
    static on(event, callback) {
        emitter.on(event, callback);
    }

    /**
     * Adds an event listener that is only called once.
     * @param {String} event The event to listen for
     * @param {Function} callback The function to call when the event is emitted
     */
    static once(event, callback) {
        emitter.once(event, callback);
    }

    /**
     * Removes an event listener.
     * @param {String} event The event to remove
     * @param {Function} callback The listener to remove
     */
    static off(event, callback) {
        emitter.removeListener(event, callback);
    }

    /**
     * Emits an event
     * @param {String} event The event to emit
     * @param {Any} ...data Data to pass to the event listeners
     */
    static emit(...args) {
        emitter.emit(...args);
    }

}
