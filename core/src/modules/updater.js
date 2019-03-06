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
import semver from 'semver';

const TEST_UPDATE = [
    {
        'id': 'core',
        'version': '2.0.0-beta.5'
    },
    {
        'id': 'client',
        'version': '2.0.0-beta.5'
    },
    {
        'id': 'editor',
        'version': '0.4.1'
    }
];

class ReleaseInfo {

    constructor(versions) {
        this.versions = versions;
    }

    get core() {
        const f = this.files.find(f => f.id === 'core');
        return {
            id: 'core',
            currentVersion: this.versions.core,
            version: f.version,
            upToDate: semver.satisfies(this.versions.core, `>=${f.version}`, { includePrerelease: true })
        }
    }

    get client() {
        const f = this.files.find(f => f.id === 'client');
        return {
            id: 'client',
            currentVersion: this.versions.core,
            version: f.version,
            upToDate: semver.satisfies(this.versions.client, `>=${f.version}`, { includePrerelease: true })
        }
    }

    get editor() {
        const f = this.files.find(f => f.id === 'editor');
        return {
            id: 'editor',
            currentVersion: this.versions.editor,
            version: f.version,
            upToDate: semver.satisfies(this.versions.editor, `>=${f.version}`, { includePrerelease: true })
        }
    }

    test() {
        this.files = TEST_UPDATE;
    }

}

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
            const releaseInfo = new ReleaseInfo({ core: coreVersion, client: clientVersion, editor: editorVersion });

            releaseInfo.test();
            this.debug(releaseInfo);


            return true;
        } catch (err) {
            console.log('[BetterDiscord:Updater]', err);
            this.bd.sendToDiscord('updater-error', err);
        }
    }

    debug(releaseInfo) {
        const { core, client, editor } = releaseInfo;
        if (!core.upToDate) {
            console.log(`[BetterDiscord:Updater] Core update available: ${core.currentVersion} > ${core.version}`);
        } else {
            console.log(`[BetterDiscord:Updater] Core up to date: ${core.currentVersion} = ${core.version}`);
        }

        if (!client.upToDate) {
            console.log(`[BetterDiscord:Updater] Client update available: ${client.currentVersion} > ${client.version}`);
        } else {
            console.log(`[BetterDiscord:Updater] Client up to date: ${client.currentVersion} = ${client.version}`);
        }

        if (!editor.upToDate) {
            console.log(`[BetterDiscord:Updater] Editor update available: ${editor.currentVersion} > ${editor.version}`);
        } else {
            console.log(`[BetterDiscord:Updater] Editor up to date: ${editor.currentVersion} = ${editor.version}`);
        }
    }

}
