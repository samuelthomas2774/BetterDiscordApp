/**
 * BetterDiscord Utils Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

import { PatchedFunction, Patch } from './monkeypatch';
import { Vendor } from 'modules';
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
     * Monkey-patches an object's method.
     */
    static monkeyPatch(object, methodName, options, f) {
        const patchedFunction = new PatchedFunction(object, methodName);
        const patch = new Patch(patchedFunction, options, f);
        patchedFunction.addPatch(patch);
        return patch;
    }

    /**
     * Monkey-patches an object's method and returns a promise that will be resolved with the data object when the method is called.
     * You will have to call data.callOriginalMethod() if it wants the original method to be called.
     */
    static monkeyPatchOnce(object, methodName) {
        return new Promise((resolve, reject) => {
            this.monkeyPatch(object, methodName, data => {
                data.patch.cancel();
                resolve(data);
            });
        });
    }

    /**
     * Monkeypatch function that is compatible with samogot's Lib Discord Internals.
     * Don't use this for writing new plugins as it will eventually be removed!
     */
    static compatibleMonkeyPatch(what, methodName, options) {
        const { before, instead, after, once = false, silent = false } = options;
        const cancelPatch = () => patch.cancel();

        const compatible_function = _function => data => {
            const compatible_data = {
                thisObject: data.this,
                methodArguments: data.arguments,
                returnValue: data.return,
                cancelPatch,
                originalMethod: data.originalMethod,
                callOriginalMethod: () => data.callOriginalMethod()
            };
            try {
                _function(compatible_data);
                data.arguments = compatible_data.methodArguments;
                data.return = compatible_data.returnValue;
            } catch (err) {
                data.arguments = compatible_data.methodArguments;
                data.return = compatible_data.returnValue;
                throw err;
            }
        };

        const patch = this.monkeyPatch(what, methodName, {
            before: before ? compatible_function(before) : undefined,
            instead: instead ? compatible_function(instead) : undefined,
            after: after ? compatible_function(after) : undefined,
            once
        });

        return cancelPatch;
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

    static compare(value1, value2) {
        // Check to see if value1 and value2 contain the same data
        if (typeof value1 !== typeof value2) return false;
        if (value1 === null && value2 === null) return true;
        if (value1 === null || value2 === null) return false;

        if (typeof value1 === 'object' || typeof value1 === 'array') {
            // Loop through the object and check if everything's the same
            let value1array = typeof value1 === 'array' ? value1 : Object.keys(value1);
            let value2array = typeof value2 === 'array' ? value2 : Object.keys(value2);
            if (value1array.length !== value2array.length) return false;

            for (let key in value1) {
                if (!this.compare(value1[key], value2[key])) return false;
            }
        } else if (value1 !== value2) return false;

        // value1 and value2 contain the same data
        return true;
    }

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

    static deepfreeze(object) {
        if (typeof object === 'object' && object !== null) {
            const properties = Object.getOwnPropertyNames(object);

            for (let property of properties) {
                this.deepfreeze(object[property]);
            }

            Object.freeze(object);
        }

        return object;
    }
}

export class FileUtils {
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
        return new Promise((resolve, reject) => {
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

    static async createDirectory(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, err => {
                if (err) {
                    if (err.code === 'EEXIST') return resolve();
                    else return reject(err);
                }
                resolve();
            });
        });
    }

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

    static async readFile(path) {
        try {
            await this.fileExists(path);
        } catch (err) {
            throw (err);
        }

        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if (err) reject({
                    'message': `Could not read file: ${path}`,
                    err
                });

                resolve(data);
            });
        });
    }

    static async readFileBuffer(path, options) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, options || {}, (err, data) => {
                if (err) return reject(err);
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

    static async listDirectory(path) {
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

    static async readDir(path) {
        return this.listDirectory(path);
    }

    static async getFileType(buffer) {
        if (typeof buffer === 'string') buffer = await this.readFileBuffer(buffer);

        return filetype(buffer);
    }

    static async toDataURI(buffer, type) {
        if (typeof buffer === 'string') buffer = await this.readFileBuffer(buffer);
        if (!type) type = this.getFileType(buffer).mime;
        return `data:${type};base64,${buffer.toString('base64')}`;
    }
}
