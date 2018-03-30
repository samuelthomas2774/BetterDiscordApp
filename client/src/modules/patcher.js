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
import { ClientLogger as Logger, Utils } from 'common';

export class Patcher {

    static get patches() { return this._patches || (this._patches = {}) }

    static getPatchesByCaller(id) {
        const patches = [];
        for (const patch in this.patches) {
            if (this.patches.hasOwnProperty(patch)) {
                if (this.patches[patch].caller === id) patches.push(this.patches[patch]);
            }
        }
        return patches;
    }

    static unpatchAll(patches) {
        if (typeof patches === 'string')
            patches = this.getPatchesByCaller(patches);

        for (const patch of patches) {
            for (const child of patch.children) {
                child.unpatch();
            }
        }
    }

    static resolveModule(module) {
        if (module instanceof Function || (module instanceof Object && !(module instanceof Array))) return module;
        if (typeof module === 'string') return WebpackModules.getModuleByName(module);
        if (module instanceof Array) return WebpackModules.getModuleByProps(module);
        return null;
    }

    static overrideFn(patch) {
        return function () {
            let retVal = undefined;
            if (!patch.children) return patch.originalFunction.apply(this, arguments);
            for (const superPatch of patch.children.filter(c => c.type === 'before')) {
                try {
                    superPatch.callback(this, arguments);
                } catch (err) {
                    Logger.err(`Patcher:${patch.id}`, err);
                }
            }

            const insteads = patch.children.filter(c => c.type === 'instead');
            if (!insteads.length) {
                retVal = patch.originalFunction.apply(this, arguments);
            } else {
                for (const insteadPatch of insteads) {
                    try {
                        retVal = insteadPatch.callback(this, arguments);
                    } catch (err) {
                        Logger.err(`Patcher:${patch.id}`, err);
                    }
                }
            }

            for (const slavePatch of patch.children.filter(c => c.type === 'after')) {
                try {
                    slavePatch.callback(this, arguments, retVal);
                } catch (err) {
                    Logger.err(`Patcher:${patch.id}`, err);
                }
            }
            return retVal;
        }
    }

    static rePatch(patch) {
        patch.proxyFunction = patch.module[patch.functionName] = this.overrideFn(patch);
    }

    static pushPatch(caller, id, module, functionName) {
        const patch = {
            caller,
            id,
            module,
            functionName,
            originalFunction: module[functionName],
            proxyFunction: null,
            revert: () => { // Calling revert will destroy any patches added to the same module after this
                patch.module[patch.functionName] = patch.originalFunction;
                patch.proxyFunction = null;
                patch.slaves = patch.supers = [];
            },
            counter: 0,
            children: []
        };
        patch.proxyFunction = module[functionName] = this.overrideFn(patch);
        return this.patches[id] = patch;
    }

    static before() { return this.pushChildPatch(...arguments, 'before') }
    static after() { return this.pushChildPatch(...arguments, 'after') }
    static instead() { return this.pushChildPatch(...arguments, 'instead') }

    static pushChildPatch(caller, unresolvedModule, functionName, callback, displayName, type = 'after') {
        const module = this.resolveModule(unresolvedModule);
        if (!module || !module[functionName] || !(module[functionName] instanceof Function)) return null;
        displayName = typeof unresolvedModule === 'string' ? unresolvedModule :
            displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}:${functionName}:${caller}`;

        const patch = this.patches[patchId] || this.pushPatch(caller, patchId, module, functionName);
        if (!patch.proxyFunction) this.rePatch(patch);
        const child = {
            caller,
            type,
            id: patch.counter,
            callback,
            unpatch: () => {
                patch.children.splice(patch.children.findIndex(cpatch => cpatch.id === child.id && cpatch.type === type), 1);
                if (patch.children.length <= 0) delete this.patches[patchId];
            }
        };
        patch.children.push(child);
        patch.counter++;
        return child.unpatch;
    }

}

export const MonkeyPatch = (caller, module, displayName) => ({
    before: (functionName, callBack) => Patcher.before(caller, module, functionName, callBack, displayName),
    after: (functionName, callBack) => Patcher.after(caller, module, functionName, callBack, displayName),
    instead: (functionName, callBack) => Patcher.instead(caller, module, functionName, callBack, displayName)
});
