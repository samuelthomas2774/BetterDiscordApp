/**
 * BetterDiscord Utils Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const
    path = require('path'),
    fs = require('fs');

const { Module } = require('./modulebase');

class Utils {

    static async tryParseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        }catch(err) {
            throw ({
                'message': 'Failed to parse json',
                err
            });
        }
    }

    static get timestamp() {
        return 'Timestamp';
    }

}

class FileUtils {

    static async fileExists(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if(err) return reject({
                    'message': `No such file or directory: ${err.path}`,
                    err
                });

                if(!stats.isFile()) return reject({
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
                if(err) return reject({
                    'message': `Directory does not exist: ${path}`,
                    err
                });

                if(!stats.isDirectory()) return reject({
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
        } catch(err) {
            throw(err);
        }

        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if(err) reject({
                    'message': `Could not read file: ${path}`,
                    err
                });

                resolve(data);
            });
        });
    }

    static async readJsonFromFile(path) {
        let readFile;
        try {
            readFile = await this.readFile(path);
        } catch(err) {
            throw(err);
        }

        try {
            const parsed = await Utils.tryParseJson(readFile);
            return parsed;
        } catch(err) {
            throw(Object.assign(err, { path }));
        }
    }
}

class WindowUtils extends Module {

    bindings() {
        this.openDevTools = this.openDevTools.bind(this);
        this.executeJavascript = this.executeJavascript.bind(this);
        this.injectScript = this.injectScript.bind(this);
    }

    get window() {
        return this.state.window;
    }

    get webContents() {
        return this.window.webContents;
    }

    openDevTools() {
        this.webContents.openDevTools();
    }

    executeJavascript(script) {
        this.webContents.executeJavaScript(script);
    }

    injectScript(fpath, variable) {
        console.log(`Injecting: ${fpath}`);
        if (variable) this.executeJavascript(`${variable} = require("${fpath}");`);
        else this.executeJavascript(`require("${fpath}");`);
    }

    events(event, callback) {
        this.webContents.on(event, callback);
    }

    send(channel, message) {
        channel = channel.startsWith('bd-') ? channel : `bd-${channel}`;
        this.webContents.send(channel, message);
    }

}

module.exports = {
    Utils,
    FileUtils,
    WindowUtils
}