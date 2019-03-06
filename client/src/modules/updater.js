/**
 * BetterDiscord Updater Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Events from './events';
import Module from './imodule';

export default new class extends Module {

    get updates() { return this.state.updates }
    get bdUpdates() { return this.state.updates.bd }

    constructor() {
        super({
            updatesAvailable: false,
            error: null,
            updates: { bd: [] }
        });
    }

    events(ipc) {
        ipc.on('updater-checkForUpdates', () => {
            Events.emit('update-check-start');
        });

        ipc.on('updater-noUpdates', () => {
            Events.emit('update-check-end');
        });

        ipc.on('updater-updatesAvailable', (_, updates) => {
            console.log('UPDATES', updates);
        });
    }

}
