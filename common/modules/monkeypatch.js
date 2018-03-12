/**
 * BetterDiscord Monkeypatch
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils } from './utils';
import { ClientLogger as Logger } from './logger';

const patchedFunctions = new WeakMap();

export class PatchedFunction {
    constructor(object, methodName, replaceOriginal = true) {
        if (patchedFunctions.has(object[methodName])) {
            const patchedFunction = patchedFunctions.get(object[methodName]);
            if (replaceOriginal) patchedFunction.replaceOriginal();
            return patchedFunction;
        }

        this.object = object;
        this.methodName = methodName;
        this.patches = [];
        this.originalMethod = object[methodName];

        const patchedFunction = this;
        this.replace = function(...args) {
            return patchedFunction.call(this, arguments);
        };

        patchedFunctions.set(object[methodName], this);
        patchedFunctions.set(this.replace, this);

        if (replaceOriginal)
            this.replaceOriginal();
    }

    /**
     * Adds a patch to this patched function.
     * @param {Patch} patch The patch to add to this patched function
     */
    addPatch(...patches) {
        for (let patch of patches) {
            if (!patch.patchedFunction) patch.patchedFunction = this;
            if (patch.patchedFunction === this && !this.patches.includes(patch)) {
                this.patches.push(patch);
            }
        }
    }

    /**
     * Removes a patch from this patched function.
     * @param {Patch} patch The patch to remove from this patched function
     * @param {Boolean} restoreOriginal Whether to restore the original function is this patched function has no more patches
     */
    removePatch(patch, restoreOriginal) {
        Utils.removeFromArray(this.patches, patch);

        if (typeof restoreOriginal === 'undefined')
            restoreOriginal = this.object[this.methodName] === this.originalMethod;

        if (!this.patches.length && restoreOriginal)
            this.restoreOriginal();
    }

    /**
     * Replaces the original function with the patched function.
     */
    replaceOriginal() {
        if (this.replaced) return;
        Object.assign(this.replace, this.object[this.methodName]);

        Object.defineProperty(this.object, this.methodName, {
            get: () => this.replace,
            set: newFunction => {
                Logger.warn('MonkeyPatch', [this.object, this.methodName, 'was monkeypatched by another function! - repatching']);
                patchedFunctions.set(newFunction, this);
                this.originalMethod = newFunction;
            }
        });
    }

    /**
     * Replaces the patched function with the original function.
     */
    restoreOriginal() {
        if (!this.replaced) return;
        const value = Object.assign(this.originalMethod, this.replace);

        Object.defineProperty(this.object, this.methodName, { value });
    }

    /**
     * Calls the patched function with the passed context and arguments.
     * @param {Any} this The context to pass to the original method
     * @param {Array} args An array of argument to pass to the original method
     * @return {Any} The original method's return value
     */
    call(_this, args) {
        const data = {
            this: _this,
            arguments: args,
            return: undefined,
            returned: undefined,
            originalMethod: this.originalMethod,
            callOriginalMethod: () => {
                Logger.log('MonkeyPatch', [`Calling original method`, this, data]);
                data.return = this.originalMethod.apply(data.this, data.arguments);
            }
        };

        // Work through the patches calling each patch's hooks as if each patch had overridden the previous patch
        for (let patch of this.patches) {
            let callOriginalMethod = data.callOriginalMethod;
            data.callOriginalMethod = () => {
                const patch_data = Object.assign({}, data, {
                    callOriginalMethod, patch
                });
                patch.call(patch_data);
                data.arguments = patch_data.arguments;
                data.return = patch_data.return;
                data.returned = patch_data.return;
            };
        }

        data.callOriginalMethod();
        return data.return;
    }

    /**
     * Whether the original method has been replaced with the patched function.
     */
    get replaced() {
        return this.object[this.methodName] === this.replace;
    }
}

export class Patch {
    constructor(patchedFunction, options, f) {
        this.patchedFunction = patchedFunction;

        if (options instanceof Function) {
            f = options;
            options = {
                instead: data => {
                    f.call(this, data, ...data.arguments);
                }
            };
        } else if (options === 'before') {
            options = {
                before: data => {
                    f.call(this, data, ...data.arguments);
                }
            };
        } else if (options === 'after') {
            options = {
                after: data => {
                    f.call(this, data, ...data.arguments);
                }
            };
        }

        this.before = options.before || undefined;
        this.instead = options.instead || undefined;
        this.after = options.after || undefined;
        this.once = options.once || false;
        this.silent = options.silent || false;
        this.suppressErrors = typeof options.suppressErrors === 'boolean' ? options.suppressErrors : true;
    }

    /**
     * Calls the patch's hooks.
     * @param {Object} data An object containing the context, arguments, original function and return value
     */
    call(data) {
        if (this.once)
            this.cancel();

        this.callBefore(data);
        this.callInstead(data);
        this.callAfter(data);
    }

    /**
     * Calls the patch's before hook.
     * @param {Object} data An object containing the context, arguments, original function and return value
     */
    callBefore(data) {
        if (this.before)
            this.callHook('before', this.before, data);
    }

    /**
     * Calls the patch's instead hook or the original function.
     * @param {Object} data An object containing the context, arguments, original function and return value
     */
    callInstead(data) {
        if (this.instead)
            this.callHook('instead', this.instead, data);
        else data.callOriginalMethod();
    }

    /**
     * Calls the patch's after hook.
     * @param {Object} data An object containing the context, arguments, original function and return value
     */
    callAfter(data) {
        if (this.after)
            this.callHook('after', this.after, data);
    }

    /**
     * Calls a hook.
     * @param {String} hook The hook's name
     * @param {Function} function The hook function
     * @param {Object} data An object containing the context, arguments, original function and return value
     */
    callHook(hook, f, data) {
        try {
            f.call(this, data, ...data.arguments);
        } catch (err) {
            Logger.log('MonkeyPatch', [`Error thrown in ${hook} hook of`, this, '- :', err]);
            if (!this.suppressErrors) throw err;
        }
    }

    /**
     * Removes this patch from the patched function.
     */
    cancel(restoreOriginal) {
        this.patchedFunction.removePatch(this, restoreOriginal);
    }
}
