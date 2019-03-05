/**
 * BetterDiscord Updater Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './modulebase';

export default class Updater extends Module {

    constructor(bd) {
        super();
        this.bd = bd;
    }

    bindings() {
        this.checkForUpdates = this.checkForUpdates.bind(this);
        this.start = this.start.bind(this);
    }

    start(interval = 15) {
        this.updaterThread = setInterval(this.checkForUpdates, interval * 60 * 1000);
    }

    async checkForUpdates() {
        console.log('[BetterDiscord:Updater] Checking for updates');
        this.bd.sendToDiscord('updater-checkForUpdates', '');

        try {
            const { coreVersion, clientVersion, editorVersion } = this.bd.config;
            console.log('[BetterDiscord:Updater]', coreVersion, clientVersion, editorVersion);
            return true;
        } catch (err) {
            console.log('[BetterDiscord:Updater]', err);
            this.bd.sendToDiscord('updater-error', err);
        }
    }

}
