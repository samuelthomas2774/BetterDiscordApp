/**
 * BetterDiscord IPC Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { Module } = require('./modulebase');

const { ipcMain } = require('electron');

class BDIpcEvent extends Module {

    constructor(event, args) {
        super(args);
        this.ipcEvent = event;
    }

    bindings() {
        this.send = this.send.bind(this);
        this.reply = this.reply.bind(this);
    }

    send(message) {
        this.ipcEvent.sender.send(this.args.__eid, message);
    }

    reply(message) {
        this.send(message);
    }

}

class BDIpc {
    static on(channel, cb) {
        ipcMain.on(channel, (event, args) => cb(new BDIpcEvent(event, args)));
    }
}

module.exports = { BDIpc };
