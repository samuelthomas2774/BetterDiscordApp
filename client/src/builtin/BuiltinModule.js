/**
 * BetterDiscord Builtin Module Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings } from 'modules';
import { Patcher, MonkeyPatch as Patch, Cache } from 'modules';
import { ClientLogger as Logger } from 'common';

export default class BuiltinModule {

    constructor() {
        this._settingUpdated = this._settingUpdated.bind(this);
        if (this.enabled) this.enabled = this.enabled.bind(this);
        if (this.disabled) this.disabled = this.disabled.bind(this);
        if (this.applyPatches) this.applyPatches = this.applyPatches.bind(this);
        this.patch = this.patch.bind(this);
    }

    async init() {
        this.setting.on('setting-updated', this._settingUpdated);
        if (this.setting.value) {
            if (this.enabled) await this.enabled();
            if (this.applyPatches) this.applyPatches();
        }
    }

    get setting() {
        return Settings.getSetting(...this.settingPath);
    }

    get patches() {
        return Patcher.getPatchesByCaller(`BD:${this.moduleName}`);
    }

    async _settingUpdated(e) {
        if (e.value) {
            if (this.enabled) await this.enabled(e);
            if (this.applyPatches) await this.applyPatches();
            if (this.rerenderPatchedComponents) this.rerenderPatchedComponents();
        } else {
            if (this.disabled) await this.disabled(e);
            this.unpatch();
            if (this.rerenderPatchedComponents) this.rerenderPatchedComponents();
        }
    }

    get cache() {
        return {
            push: data => Cache.push(this.moduleName, data),
            find: filter => Cache.find(this.moduleName, filter)
        }
    }

    /**
     * By default unpatch everything.
     * Override to do something else.
     */
    unpatch() {
        Patcher.unpatchAll(`BD:${this.moduleName}`);
    }

    /**
     * Patch a function in a module
     * @param {any} module Module to patch
     * @param {String} fnName Name of the function to patch
     * @param {Function} cb Callback
     * @param {String} [when=after] before|after|instead
     */
    patch(module, fnName, cb, when = 'after') {
        if (!['before', 'after', 'instead'].includes(when)) when = 'after';
        return Patch(`BD:${this.moduleName}`, module)[when](fnName, cb.bind(this));
    }

    childPatch(module, fnName, child, cb, when = 'after') {
        const last = child.pop();

        this.patch(module, fnName, (component, args, retVal) => {
            const unpatch = this.patch(child.reduce((obj, key) => obj[key], retVal), last, function(...args) {unpatch(); return cb.call(this, component, ...args);}, when);
        });
    }

    /**
     * Logger wraps
     */
    log(message) {
        Logger.log(this.moduleName, message);
    }

    warn(message) {
        Logger.warn(this.moduleName, message);
    }

    info(message) {
        Logger.warn(this.moduleName, message);
    }

    debug(message) {
        Logger.dbg(this.moduleName, message);
    }
}
