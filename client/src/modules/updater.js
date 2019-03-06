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
    get error() { return null; }
    get updatesAvailable() { return this.state.updatesAvailable; }

    constructor() {
        super({
            updatesAvailable: false,
            error: null,
            updates: { bd: [] },
            updating: false
        });
    }

    events(ipc) {
        ipc.on('updater-checkForUpdates', () => {
            if (this.state.updating) return; // We're already updating. Updater should be paused anyways at this point.
            Events.emit('update-check-start');
        });

        ipc.on('updater-noUpdates', () => {
            if (this.state.updatesAvailable) return; // If for some reason we get this even though we have updates already.
            this.setState({
                updatesAvailable: false,
                updates: {}
            });
        });

        ipc.on('updater-updatesAvailable', (_, updates) => {
            if (this.state.updating) return; // If for some reason we get more updates when we're already updating
            updates.bd = updates.bd.map(update => {
                update.text = `${update.id.charAt(0).toUpperCase()}${update.id.slice(1)}`;
                update.hint = `Current: ${update.currentVersion} | Latest: ${update.version}`;
                update.status = {
                    update: true,
                    updating: false,
                    updated: false,
                    error: null
                };

                return update;
            });
            this.setState({
                updates,
                updatesAvailable: true
            });
        });
    }

    stateChanged(oldState, newState) {
        if (!newState.updatesAvailable) return Events.emit('update-check-end');
        if (!oldState.updatesAvailable && newState.updatesAvailable) return Events.emit('updates-available');
    }

    toggleUpdate(update) {
        update.status.update = !update.status.update;
    }

}
