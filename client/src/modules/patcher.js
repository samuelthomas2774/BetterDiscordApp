/**
 * BetterDiscord Component Patcher
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

import { WebpackModules } from './webpackmodules';
import { ClientLogger as Logger } from 'common';

export default class Patcher {
    static get patches() { return this._patches || (this._patches = {}) }
    static resolveModule(module) {
        if (module instanceof Function || (module instanceof Object && !(module instanceof Array))) return module;
        if ('string' === typeof module) return WebpackModules.getModuleByName(module);
        if (module instanceof Array) return WebpackModules.getModuleByProps(module);
        return null;
    }
    static overrideFn(patch) {
        return function () {
            for (const superPatch of patch.supers) {
                try {
                    superPatch.callback.apply(this, arguments);
                } catch (err) {
                    Logger.err('Patcher', err);
                }
            }
            const retVal = patch.originalFunction.apply(this, arguments);
            for (const slavePatch of patch.slaves) {
                try {
                    slavePatch.callback.apply(this, [arguments, { patch, retVal }]);
                } catch (err) {
                    Logger.err('Patcher', err);
                }
            }
            return retVal;
        }
    }

    static rePatch(patch) {
        patch.proxyFunction = patch.module[patch.functionName] = this.overrideFn(patch);
    }

    static pushPatch(id, module, functionName) {
        const patch = {
            module,
            functionName,
            originalFunction: module[functionName],
            proxyFunction: null,
            revert: () => {
                patch.module[patch.functionName] = patch.originalFunction;
                patch.proxyFunction = null;
                patch.slaves = patch.supers = [];
            },
            supers: [],
            slaves: []
        };
        patch.proxyFunction = module[functionName] = this.overrideFn(patch);
        return this.patches[id] = patch;
    }

    static get before() { return this.superpatch; }
    static superpatch(unresolveModule, functionName, callback, displayName) {
        const module = this.resolveModule(unresolveModule);
        if (!module || !module[functionName] || !(module[functionName] instanceof Function)) return null;
        displayName = 'string' === typeof unresolveModule ? unresolveModule : displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}:${functionName}`;

        const patch = this.patches[patchId] || this.pushPatch(patchId, module, functionName);
        if (!patch.proxyFunction) this.rePatch(patch);
        const id = patch.supers.length + 1;
        const superPatch = {
            id,
            callback,
            unpactch: () => patch.slaves.splice(patch.slaves.findIndex(slave => slave.id === id), 1) // This doesn't actually work correctly not, fix in a moment
        };

        patch.supers.push(superPatch);
        return superPatch;
    }

    static get after() { return this.slavepatch; }
    static slavepatch(unresolveModule, functionName, callback, displayName) {
        const module = this.resolveModule(unresolveModule);
        if (!module || !module[functionName] || !(module[functionName] instanceof Function)) return null;
        displayName = 'string' === typeof unresolveModule ? unresolveModule : displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}:${functionName}`;

        const patch = this.patches[patchId] || this.pushPatch(patchId, module, functionName);
        if (!patch.proxyFunction) this.rePatch(patch);
        const id = patch.slaves.length + 1;
        const slavePatch = {
            id,
            callback,
            unpactch: () => patch.slaves.splice(patch.slaves.findIndex(slave => slave.id === id), 1) // This doesn't actually work correctly not, fix in a moment
        };

        patch.slaves.push(slavePatch);
        return slavePatch;
    }
}
