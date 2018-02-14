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
import { $ } from 'vendor';
import { ClientLogger as Logger } from 'common';

export default class {

    constructor() {
        window.updater = this;
        this.updatesAvailable = false;
        this.init = this.init.bind(this);
        this.checkForUpdates = this.checkForUpdates.bind(this);
    }

    get interval() {
        return 60 * 1000 * 30;
    }

    init() {
        setInterval(this.checkForUpdates, this.interval);
    }

    update() {
        // TODO
        this.updatesAvailable = false;
        Events.emit('update-check-end');
    }

    checkForUpdates() {
        if (this.updatesAvailable) return;
        Events.emit('update-check-start');
        Logger.info('Updater', 'Checking for updates');
        $.ajax({
            type: 'GET',
            url: 'https://rawgit.com/JsSucks/BetterDiscordApp/master/package.json',
            cache: false,
            success: e => {
                try {
                    Events.emit('update-check-end');
                    Logger.info('Updater',
                        `Latest Version: ${e.version} - Current Version: ${Globals.getObject('version')}`);
                    if (e.version !== Globals.getObject('version')) {
                        this.updatesAvailable = true;
                        Events.emit('updates-available');
                    }
                } catch (err) {
                    Events.emit('update-check-fail', err);
                }
            },
            fail: e => Events.emit('update-check-fail', e)
        });
    }

}
