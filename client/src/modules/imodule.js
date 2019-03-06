/**
 * BetterDiscord Module Base
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

/**
 * Base Module that every non-static module should extend
 */

import { ClientLogger as Logger, ClientIPC } from 'common';

export default class Module {

    constructor(args) {
        this.__ = {
            state: args || {},
            args
        };
        this.setState = this.setState.bind(this);

        if (this.delay) { // If delay is set then module is set to load delayed from modulemanager
            this.initialize = this.initialize.bind(this);
            this.init = this.initialize;
        } else {
            this.initialize();
            this.init = () => { };
        }
    }

    initialize() {
        if (this.bindings) this.bindings();
        if (this.setInitialState) this.setState(this.setInitialState(this.state));
        if (this.events) this.events(ClientIPC);
    }

    setState(newState) {
        const oldState = Object.assign({}, this.state);
        Object.assign(this.state, newState);
        if (this.stateChanged) this.stateChanged(oldState, newState);
    }

    set args(t) { }
    get args() { return this.__.args; }

    set state(state) { return this.__.state = state; }
    get state() { return this.__.state; }

    async send(channel, message) {
        return ClientIPC.send(channel, message);
    }

    log(msg) {
        Logger.log(this.name, msg);
    }

    warn(msg) {
        Logger.log(this.name, msg);
    }

    err(msg) {
        Logger.log(this.name, msg);
    }

    info(msg) {
        Logger.log(this.name, msg);
    }

}
