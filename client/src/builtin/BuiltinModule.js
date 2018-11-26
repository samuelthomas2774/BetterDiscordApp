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

    init() {
        this.setting.on('setting-updated', this._settingUpdated);
        if (this.setting.value) {
            if (this.enabled) this.enabled();
            if (this.applyPatches) this.applyPatches();
        }
    }

    get setting() {
        return Settings.getSetting(...this.settingPath);
    }

    get patches() {
        return Patcher.getPatchesByCaller(`BD:${this.moduleName}`);
    }

    _settingUpdated(e) {
        const { value } = e;
        if (value === true) {
            if (this.enabled) this.enabled(e);
            if (this.applyPatches) this.applyPatches();
            return;
        }
        if (value === false) {
            if (this.disabled) this.disabled(e);
            this.unpatch();
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
        Patch(`BD:${this.moduleName}`, module)[when](fnName, cb.bind(this));
    }

    childPatch(module, fnName, child, cb, when = 'after') {
        this.patch(module, fnName, (component, args, retVal) => {
            this.patch(retVal[child[0]], child[1], cb, when);
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
