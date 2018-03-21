/**
 * BetterDiscord Database Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientIPC } from 'common';

export default class {

    static async init() {
        return true;
    }

    /**
     * Inserts or updates data in the database.
     * @param {Object} args The record to find
     * @param {Object} data The new record
     * @return {Promise}
     */
    static async insertOrUpdate(args, data) {
        try {
            return ClientIPC.send('bd-dba', { action: 'update', args, data });
        } catch (err) {
            throw err;
        }
    }

    /**
     * Finds data in the database.
     * @param {Object} args The record to find
     * @return {Promise}
     */
    static async find(args) {
        try {
            return ClientIPC.send('bd-dba', { action: 'find', args });
        } catch (err) {
            throw err;
        }
    }

}
