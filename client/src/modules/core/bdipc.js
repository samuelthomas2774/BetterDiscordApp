/**
 * BetterDiscord Client IPC Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

const { ipcRenderer } = require('electron');

class BDIpc {
    static on(channel, cb) {
        ipcRenderer.on(channel, (event, message) => cb(event, message));
    }

    static async send(channel, message) {
        channel = channel.startsWith('bd-') ? channel : `bd-${channel}`;
        const __eid = Date.now().toString();
        ipcRenderer.send(channel, Object.assign(message ? message : {}, { __eid }));
        return new Promise((resolve, reject) => {
            ipcRenderer.once(__eid, (event, arg) => resolve(arg));
        });
    }

}

module.exports = { BDIpc };