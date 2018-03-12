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
import { FileUtils } from './utils';

const logs = [];

export class Logger {

    constructor() {
        this.logs = [];
        this.file = undefined;
    }

    err(module, message) { this.log(module, message, 'err'); }
    warn(module, message) { this.log(module, message, 'warn'); }
    info(module, message) { this.log(module, message, 'info'); }
    dbg(module, message) { this.log(module, message, 'dbg'); }

    /**
     * Logs a message.
     * @param {String} module The module to show the log as
     * @param {Any} message Data to be logged
     * @param {String} level The log level
     */
    log(module, message, level = 'log') {
        level = Logger.parseLevel(level);
        if (typeof message === 'object' && !(message instanceof Array)) {
            console[level]('[%cBetter%cDiscord:%s]', 'color: #3E82E5', '', `${module}${level === 'debug' ? '|DBG' : ''}`, message);
            let message_string = message.toString();
            if (message_string === '[object Object]')
                message_string += ' ' + JSON.stringify(message, null, 4);

            logs.push(`${level.toUpperCase()} : [${Logger.timestamp}|${module}] ${message_string}${message_string === '[object Object]' ? ' ' + JSON.stringify(message, null, 4) : ''}`);
            return;
        }

        message = typeof message === 'object' && message instanceof Array ? message : [message];
        console[level]('[%cBetter%cDiscord:%s]', 'color: #3E82E5', '', `${module}${level === 'debug' ? '|DBG' : ''}`, ...message);
        logs.push(`${level.toUpperCase()} : [${Logger.timestamp}|${module}] ${message.join(' ')}`);

        if (this.file)
            FileUtils.appendToFile(this.file, `${level.toUpperCase()} : [${Logger.timestamp}|${module}] ${message.join(' ')}\n`);
    }

    /**
     * Logs an error.
     */
    logError(err) {
        if (!err.module && !err.message) {
            console.log(err);
            return;
        }
        this.err(err.module, err.message);
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

const ClientLogger = new Logger();
export { ClientLogger };
