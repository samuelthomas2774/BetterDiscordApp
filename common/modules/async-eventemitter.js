/**
 * BetterDiscord Async EventEmitter
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import EventEmitter from 'events';

export default class AsyncEventEmitter extends EventEmitter {

    emit(event, ...data) {
        return new Promise(async (resolve, reject) => {
            let listeners = this._events[event] || [];
            listeners = Array.isArray(listeners) ? listeners : [listeners];

            // Special treatment of internal newListener and removeListener events
            if(event === 'newListener' || event === 'removeListener') {
                data = [{
                    event: data,
                    fn: err => {
                        if (err) throw err;
                    }
                }];
            }

            for (let listener of listeners) {
                try {
                    await listener.call(this, ...data);
                } catch (err) {
                    return reject(err);
                }
            }

            resolve();
        });
    }

}
