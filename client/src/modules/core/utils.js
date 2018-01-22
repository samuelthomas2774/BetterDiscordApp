/**
 * BetterDiscord Client Utils Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

const { Module } = require('./modulebase');
const fs = window.require('fs');
const path = window.require('path');

const logs = [];

class Logger {

    static err(module, message) { this.log(module, message, 'err'); }
    static warn(module, message) { this.log(module, message, 'warn'); }
    static info(module, message) { this.log(module, message, 'info'); }
    static dbg(module, message) { this.log(module, message, 'dbg'); }
    static log(module, message, level = 'log') {
        message = message.message || message;
        if (typeof message === 'object') {
            //TODO object handler for logs
            console.log(message);
            return;
        }
        level = this.parseLevel(level);
        console[level]('[%cBetter%cDiscord:%s] %s', 'color: #3E82E5', '', `${module}${level === 'debug' ? '|DBG' : ''}`, message);
        logs.push(`[${BetterDiscord.vendor.moment().format('DD/MM/YY hh:mm:ss')}|${module}|${level}] ${message}`);
        window.bdlogs = logs;
    }

    static logError(err) {
        if (!err.module && !err.message) {
            console.log(err);
            return;
        }
        this.err(err.module, err.message);
    }

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

    static parseLevel(level) {
        return this.levels.hasOwnProperty(level) ? this.levels[level] : 'log';
    }
}

class Utils {

    static overload(fn, cb) {
        const orig = fn;
        return function(...args) {
            orig(...args);
            cb(...args);
        }
    }

    static async tryParseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (err) {
            throw ({
                'message': 'Failed to parse json',
                err
            });
        }
    }
    
}

class FileUtils {

    static async fileExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) return reject({
                    'message': `No such file or directory: ${err.path}`,
                    err
                });

                if (!stats.isFile()) return reject({
                    'message': `Not a file: ${path}`,
                    stats
                });

                resolve();
            });
        });
    }

    static async directoryExists(path) {
        return new Promise(resolve => {
            fs.stat(path, (err, stats) => {
                if (err) return reject({
                    'message': `Directory does not exist: ${path}`,
                    err
                });

                if (!stats.isDirectory()) return reject({
                    'message': `Not a directory: ${path}`,
                    stats
                });

                resolve();
            });
        });
    }

    static async readFile(path) {
        try {
            await this.fileExists(path);
        } catch (err) {
            throw (err);
        }

        return new Promise(resolve => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if (err) reject({
                    'message': `Could not read file: ${path}`,
                    err
                });

                resolve(data);
            });
        });
    }

    static async writeFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    static async readJsonFromFile(path) {
        let readFile;
        try {
            readFile = await this.readFile(path);
        } catch (err) {
            throw (err);
        }

        try {
            const parsed = await Utils.tryParseJson(readFile);
            return parsed;
        } catch (err) {
            throw (Object.assign(err, { path }));
        }
    }

    static async writeJsonToFile(path, json) {
        return this.writeFile(path, JSON.stringify(json));
    }

    static async readDir(path) {
        try {
            await this.directoryExists(path);
            return new Promise((resolve, reject) => {
                fs.readdir(path, (err, files) => {
                    if (err) return reject(err);
                    resolve(files);
                });
            });
        } catch (err) {
            throw err;
        }
    }
}

class Filters {
    static byProperties(props, selector = m => m) {
        return module => {
            const component = selector(module);
            if (!component) return false;
            return props.every(property => component[property] !== undefined);
        };
    }

    static byPrototypeFields(fields, selector = m => m) {
        return module => {
            const component = selector(module);
            if (!component) return false;
            if (!component.prototype) return false;
            return fields.every(field => component.prototype[field] !== undefined);
        };
    }

    static byCode(search, selector = m => m) {
        return module => {
            const method = selector(module);
            if (!method) return false;
            return method.toString().search(search) !== -1;
        };
    }

    static byDisplayName(name) { 
        return module => {
            return module && module.displayName === name;
        };
    }

    static combine(...filters) { 
        return module => {
            return filters.every(filter => filter(module));
        };
    }
};

module.exports = { Logger, Utils, FileUtils, Filters }