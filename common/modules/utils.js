/**
 * BetterDiscord Utils Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import filetype from 'file-type';

export class Utils {
    static overload(fn, cb) {
        const orig = fn;
        return function (...args) {
            orig(...args);
            cb(...args);
        }
    }

    /**
     * Attempts to parse a string as JSON.
     * @param {String} json The string to parse
     * @return {Any}
     */
    static async tryParseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (err) {
            throw ({
                message: 'Failed to parse json',
                err
            });
        }
    }

    /**
     * Returns a new object with normalised keys.
     * @param {Object} object
     * @return {Object}
     */
    static toCamelCase(o) {
        const camelCased = {};
        _.forEach(o, (value, key) => {
            if (_.isPlainObject(value) || _.isArray(value)) {
                value = this.toCamelCase(value);
            }
            camelCased[_.camelCase(key)] = value;
        });
        return camelCased;
    }

    /**
     * Checks if two or more values contain the same data.
     * @param {Any} ...value The value to compare
     * @return {Boolean}
     */
    static compare(value1, value2, ...values) {
        // Check to see if value1 and value2 contain the same data
        if (typeof value1 !== typeof value2) return false;
        if (value1 === null && value2 === null) return true;
        if (value1 === null || value2 === null) return false;

        if (typeof value1 === 'object') {
            // Loop through the object and check if everything's the same
            if (Object.keys(value1).length !== Object.keys(value2).length) return false;

            for (let key in value1) {
                if (!this.compare(value1[key], value2[key])) return false;
            }
        } else if (value1 !== value2) return false;

        // value1 and value2 contain the same data
        // Check any more values
        for (let value3 of values) {
            if (!this.compare(value1, value3))
                return false;
        }

        return true;
    }

    /**
     * Clones an object and all it's properties.
     * @param {Any} value The value to clone
     * @return {Any} The cloned value
     */
    static deepclone(value) {
        if (typeof value === 'object') {
            if (value instanceof Array) return value.map(i => this.deepclone(i));

            const clone = Object.assign({}, value);

            for (let key in clone) {
                clone[key] = this.deepclone(clone[key]);
            }

            return clone;
        }

        return value;
    }

    /**
     * Freezes an object and all it's properties.
     * @param {Any} object The object to freeze
     * @param {Function} exclude A function to filter object that shouldn't be frozen
     */
    static deepfreeze(object, exclude) {
        if (exclude && exclude(object)) return;

        if (typeof object === 'object' && object !== null) {
            const properties = Object.getOwnPropertyNames(object);

            for (let property of properties) {
                this.deepfreeze(object[property], exclude);
            }

            Object.freeze(object);
        }

        return object;
    }

    /**
     * Removes an item from an array. This differs from Array.prototype.filter as it mutates the original array instead of creating a new one.
     * @param {Array} array The array to filter
     * @param {Any} item The item to remove from the array
     * @return {Array}
     */
    static removeFromArray(array, item) {
        let index;
        while ((index = array.indexOf(item)) > -1)
            array.splice(index, 1);
        return array;
    }

    /**
     * Defines a property with a getter that can be changed like a normal property.
     * @param {Object} object The object to define a property on
     * @param {String} property The property to define
     * @param {Function} getter The property's getter
     * @return {Object}
     */
    static defineSoftGetter(object, property, get) {
        return Object.defineProperty(object, property, {
            get,
            set: value => Object.defineProperty(object, property, {
                value,
                writable: true,
                configurable: true,
                enumerable: true
            }),
            configurable: true,
            enumerable: true
        });
    }

    static wait(time = 0) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    static async until(check, time = 0) {
        let value, i;
        do {
            // Wait for the next tick
            await new Promise(resolve => setTimeout(resolve, time));
            value = check(i);
            i++;
        } while (!value);
        return value;
    }
}

export class FileUtils {
    /**
     * Checks if a file exists and is a file.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async fileExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) return reject({
                    message: `No such file or directory: ${err.path}`,
                    err
                });

                if (!stats.isFile()) return reject({
                    message: `Not a file: ${path}`,
                    stats
                });

                resolve();
            });
        });
    }

    /**
     * Checks if a directory exists and is a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async directoryExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) return reject({
                    message: `Directory does not exist: ${path}`,
                    err
                });

                if (!stats.isDirectory()) return reject({
                    message: `Not a directory: ${path}`,
                    stats
                });

                resolve();
            });
        });
    }

    /**
     * Creates a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async createDirectory(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Checks if a directory exists and creates it if it doesn't.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async ensureDirectory(path) {
        try {
            await this.directoryExists(path);
            return true;
        } catch (err) {
            try {
                await this.createDirectory(path);
                return true;
            } catch (err) {
                throw err;
            }
        }
    }

    /**
     * Returns the contents of a file.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async readFile(path) {
        try {
            await this.fileExists(path);
        } catch (err) {
            throw err;
        }

        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if (err) return reject({
                    message: `Could not read file: ${path}`,
                    err
                });

                resolve(data);
            });
        });
    }

    /**
     * Returns the contents of a file.
     * @param {String} path The file's path
     * @param {Object} options Additional options to pass to fs.readFile
     * @return {Promise}
     */
    static async readFileBuffer(path, options) {
        try {
            await this.fileExists(path);
        } catch (err) {
            throw err;
        }

        return new Promise((resolve, reject) => {
            fs.readFile(path, options || {}, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    /**
     * Writes to a file.
     * @param {String} path The file's path
     * @param {String} data The file's new contents
     * @return {Promise}
     */
    static async writeFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Writes to the end of a file.
     * @param {String} path The file's path
     * @param {String} data The data to append to the file
     * @return {Promise}
     */
    static async appendToFile(path, data) {
        return new Promise((resolve, reject) => {
            fs.appendFile(path, data, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * Returns the contents of a file parsed as JSON.
     * @param {String} path The file's path
     * @return {Promise}
     */
    static async readJsonFromFile(path) {
        let readFile;
        try {
            readFile = await this.readFile(path);
        } catch (err) {
            throw (err);
        }

        try {
            return await Utils.tryParseJson(readFile);
        } catch (err) {
            throw Object.assign(err, { path });
        }
    }

    /**
     * Writes to a file as JSON.
     * @param {String} path The file's path
     * @param {Any} data The file's new contents
     * @return {Promise}
     */
    static async writeJsonToFile(path, json) {
        return this.writeFile(path, JSON.stringify(json));
    }

    /**
     * Returns an array of items in a directory.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async listDirectory(path) {
        await this.directoryExists(path);
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });
    }

    static async readDir(path) {
        return this.listDirectory(path);
    }

    /**
     * Returns a file or buffer's MIME type and typical file extension.
     * @param {String|Buffer} buffer A buffer or the path of a file
     * @return {Promise}
     */
    static async getFileType(buffer) {
        if (typeof buffer === 'string') buffer = await this.readFileBuffer(buffer);

        return filetype(buffer);
    }

    /**
     * Returns a file's contents as a data URI.
     * @param {String} path The directory's path
     * @return {Promise}
     */
    static async toDataURI(buffer, type) {
        if (typeof buffer === 'string') buffer = await this.readFileBuffer(buffer);
        if (!type) type = this.getFileType(buffer).mime;
        return `data:${type};base64,${buffer.toString('base64')}`;
    }
}
