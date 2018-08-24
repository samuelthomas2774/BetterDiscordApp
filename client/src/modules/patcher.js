/**
 * BetterDiscord Component Patcher
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Reflection from './reflection/index';
import { ClientLogger as Logger } from 'common';

/**
 * Function with no arguments and no return value that may be called to revert changes made by {@link Patcher}, restoring (unpatching) original method.
 * @callback Patcher~unpatch
 */

/**
 * A callback that modifies method logic. This callback is called on each call of the original method and is provided all data about original call. Any of the data can be modified if necessary, but do so wisely.
 *
 * The third argument for the callback will be `undefined` for `before` patches. `originalFunction` for `instead` patches and `returnValue` for `after` patches.
 *
 * @callback Patcher~patchCallback
 * @param {object} thisObject - `this` in the context of the original function.
 * @param {arguments} arguments - The original arguments of the original function.
 * @param {(function|*)} extraValue - For `instead` patches, this is the original function from the module. For `after` patches, this is the return value of the function.
 * @return {*} Makes sense only when using an `instead` or `after` patch. If something other than `undefined` is returned, the returned value replaces the value of `returnValue`. If used for `before` the return value is ignored.
 */

export class Patcher {

    static get patches() { return this._patches || (this._patches = []) }

    /**
     * Returns all the patches done by a specific caller
     * @param {string} id - Name of the patch caller
     * @method
     */
    static getPatchesByCaller(id) {
        if (!id) return [];
        const patches = [];
        for (const patch of this.patches) {
            for (const childPatch of patch.children) {
                if (childPatch.caller === id) patches.push(childPatch);
            }
        }
        return patches;
    }

    /**
     * Unpatches all patches passed, or when a string is passed unpatches all
     * patches done by that specific caller.
     * @param {Array|string} patches - Either an array of patches to unpatch or a caller name
     */
    static unpatchAll(patches) {
        if (typeof patches === 'string')
            patches = this.getPatchesByCaller(patches);

        for (const patch of patches) {
            patch.unpatch();
        }
    }

    static resolveModule(module) {
        if (module instanceof Function || (module instanceof Object)) return module;
        if (typeof module === 'string') return Reflection.module.byName(module);
        return null;
    }

    static overrideFn(patch) {
        return function () {
            let retVal = undefined;
            if (!patch.children || !patch.children.length) return patch.originalFunction.apply(this, arguments);
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
                        const tempReturn = insteadPatch.callback(this, arguments, patch.originalFunction.bind(this));
                        if (typeof tempReturn !== 'undefined') retVal = tempReturn;
                    } catch (err) {
                        Logger.err(`Patcher:${patch.id}`, err);
                    }
                }
            }

            for (const slavePatch of patch.children.filter(c => c.type === 'after')) {
                try {
                    const tempReturn = slavePatch.callback(this, arguments, retVal, r => retVal = r);
                    if (typeof tempReturn !== 'undefined') retVal = tempReturn;
                } catch (err) {
                    Logger.err(`Patcher:${patch.id}`, err);
                }
            }
            return retVal;
        }
    }

    static rePatch(patch) {
        if (patch.module instanceof Array && typeof patch.functionName === 'number')
            patch.module.splice(patch.functionName, 1, patch.proxyFunction = this.overrideFn(patch));
        else patch.proxyFunction = patch.module[patch.functionName] = this.overrideFn(patch);
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
                patch.children = [];
            },
            counter: 0,
            children: []
        };
        patch.proxyFunction = module[functionName] = this.overrideFn(patch);
        return this.patches.push(patch), patch;
    }

    /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link Patcher#unpatchAll}.
     * @param {object} unresolvedModule - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {Patcher~patchCallback} callback - Function to run before the original method
     * @param {string} [displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @return {Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static before(caller, unresolvedModule, functionName, callback, displayName) { return this.pushChildPatch(caller, unresolvedModule, functionName, callback, displayName, 'before') }

    /**
     * This method patches onto another function, allowing your code to run afterwards.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link Patcher#unpatchAll}.
     * @param {object} unresolvedModule - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {Patcher~patchCallback} callback - Function to run after the original method
     * @param {string} [displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @return {Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static after(caller, unresolvedModule, functionName, callback, displayName) { return this.pushChildPatch(caller, unresolvedModule, functionName, callback, displayName, 'after') }

    /**
     * This method patches onto another function, allowing your code to run instead, preventing the running of the original code.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link Patcher#unpatchAll}.
     * @param {object} unresolvedModule - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {Patcher~patchCallback} callback - Function to run instead of the original method
     * @param {string} [displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @return {Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static instead(caller, unresolvedModule, functionName, callback, displayName) { return this.pushChildPatch(caller, unresolvedModule, functionName, callback, displayName, 'instead') }

    /**
     * This method patches onto another function, allowing your code to run before, instead or after the original function.
     * Using this you are able to modify the incoming arguments before the original function is run as well as the return
     * value before the original function actually returns.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link Patcher#unpatchAll}.
     * @param {object} unresolvedModule - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {Patcher~patchCallback} callback - Function to run after the original method
     * @param {string} [displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {string} [type=after] - Determines whether to run the function `before`, `instead`, or `after` the original.
     * @return {Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */
    static pushChildPatch(caller, unresolvedModule, functionName, callback, displayName, type = 'after') {
        const module = this.resolveModule(unresolvedModule);
        if (!module || !module[functionName] || !(module[functionName] instanceof Function)) return null;
        displayName = typeof unresolvedModule === 'string' ? unresolvedModule :
            displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}:${functionName}:${caller}`;

        const patch = this.patches.find(p => p.module == module && p.functionName == functionName) || this.pushPatch(caller, patchId, module, functionName);
        if (!patch.proxyFunction) this.rePatch(patch);
        const child = {
            caller,
            type,
            id: patch.counter,
            callback,
            unpatch: () => {
                patch.children.splice(patch.children.findIndex(cpatch => cpatch.id === child.id && cpatch.type === type), 1);
                if (patch.children.length <= 0) {
                    const patchNum = this.patches.findIndex(p => p.module == module && p.functionName == functionName);
                    this.patches[patchNum].revert();
                    this.patches.splice(patchNum, 1);
                }
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
