/**
 * BetterDiscord Logger Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Vendor from 'vendor';

const logs = [];

export class ClientLogger {

    static err(module, message) { this.log(module, message, 'err'); }
    static warn(module, message) { this.log(module, message, 'warn'); }
    static info(module, message) { this.log(module, message, 'info'); }
    static dbg(module, message) { this.log(module, message, 'dbg'); }

    /**
     * Logs a message.
     * @param {String} module The module to show the log as
     * @param {Any} message Data to be logged
     * @param {String} level The log level
     */
    static log(module, message, level = 'log') {
        level = this.parseLevel(level);
        if (typeof message === 'object' && !(message instanceof Array)) {
            console[level]('[%cBetter%cDiscord:%s]', 'color: #3E82E5', '', `${module}${level === 'debug' ? '|DBG' : ''}`, message);
            let message_string = message.toString();
            if (message_string === '[object Object]')
                message_string += ' ' + JSON.stringify(message, null, 4);

            logs.push(`${level.toUpperCase()} : [${this.timestamp}|${module}] ${message_string}${message_string === '[object Object]' ? ' ' + JSON.stringify(message, null, 4) : ''}`);
            return;
        }

        message = typeof message === 'object' && message instanceof Array ? message : [message];
        console[level]('[%cBetter%cDiscord:%s]', 'color: #3E82E5', '', `${module}${level === 'debug' ? '|DBG' : ''}`, ...message);
        logs.push(`${level.toUpperCase()} : [${this.timestamp}|${module}] ${message.join(' ')}`);
    }

    /**
     * Logs an error.
     */
    static logError(err) {
        if (!err.module && !err.message) {
            console.log(err);
            return;
        }
        this.err(err.module, err.message);
    }

    /**
     * An array of logged messages.
     */
    static get logs() {
        return logs;
    }

    /**
     * An array mapping log levels to console methods.
     */
    static get levels() {
        return {
            'log': 'log',
            'warn': 'warn',
            'err': 'error',
            'error': 'error',
            'debug': 'debug',
            'dbg': 'debug',
            'info': 'info'
        };
    }

    /**
     * Returns the name of the console method to call for a specific log level.
     */
    static parseLevel(level) {
        return this.levels.hasOwnProperty(level) ? this.levels[level] : 'log';
    }

    static get timestamp() {
        try {
            return Vendor.moment().format('DD/MM/YY hh:mm:ss');
        } catch (err) {
            return (new Date()).toString();
        }
    }

}
