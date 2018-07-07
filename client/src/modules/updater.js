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
import Globals from './globals';
import { axios } from 'vendor';
import { ClientLogger as Logger } from 'common';

export default new class {

    constructor() {
        this.updatesAvailable = false;
        this.latestVersion = undefined;
        this.error = undefined;

        this.init = this.init.bind(this);
        this.checkForUpdates = this.checkForUpdates.bind(this);
    }

    /**
     * The interval to wait before checking for updates.
     */
    get interval() {
        return 60 * 1000 * 30;
    }

    init() {
        this.updateInterval = setInterval(this.checkForUpdates, this.interval);
    }

    /**
     * Installs an update.
     * TODO
     */
    async update() {
        try {
            await new Promise(resolve => setTimeout(resolve, 5000));

            this.updatesAvailable = false;
            this.latestVersion = Globals.version;
            Events.emit('update-check-end');
        } catch (err) {
            this.error = err;
            this.checkForUpdates();
            throw err;
        }
    }

    /**
     * Checks for updates.
     * @return {Promise}
     */
    async checkForUpdates() {
        if (this.updatesAvailable) return true;
        Events.emit('update-check-start');
        Logger.info('Updater', 'Checking for updates');

        try {
            const response = await axios.get('https://rawgit.com/JsSucks/BetterDiscordApp/master/package.json');

            this.latestVersion = response.data.version;
            Events.emit('update-check-end');
            Logger.info('Updater', `Latest Version: ${response.data.version} - Current Version: ${Globals.version}`);

            if (this.latestVersion !== Globals.version) {
                this.updatesAvailable = true;
                Events.emit('updates-available');
                return true;
            }

            return false;
        } catch (err) {
            Events.emit('update-check-fail', err);
            throw err;
        }
    }

}
