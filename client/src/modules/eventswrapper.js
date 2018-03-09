/**
 * BetterDiscord Events Wrapper Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const eventemitters = new WeakMap();

export default class EventsWrapper {
    constructor(eventemitter) {
        eventemitters.set(this, eventemitter);
    }

    get eventSubs() {
        return this._eventSubs || (this._eventSubs = []);
    }

    subscribe(event, callback) {
        if (this.eventSubs.find(e => e.event === event && e.callback === callback)) return;
        this.eventSubs.push({
            event,
            callback
        });
        eventemitters.get(this).on(event, callback);
    }

    unsubscribe(event, callback) {
        for (let index of this.eventSubs) {
            if (this.eventSubs[index].event !== event || (callback && this.eventSubs[index].callback === callback)) return;
            eventemitters.get(this).off(event, this.eventSubs[index].callback);
            this.eventSubs.splice(index, 1);
        }
    }

    unsubscribeAll() {
        for (let event of this.eventSubs) {
            eventemitters.get(this).off(event.event, event.callback);
        }
        this.eventSubs.splice(0, this.eventSubs.length);
    }
}
