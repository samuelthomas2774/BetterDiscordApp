/**
 * BetterDiscord Monkeypatch
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger } from './logger';

export class PatchedFunction {
    constructor(object, methodName, replaceOriginal = true) {
        if (object[methodName].__monkeyPatch)
            return object[methodName].__monkeyPatch;

        this.object = object;
        this.methodName = methodName;
        this.patches = [];
        this.originalMethod = object[methodName];
        this.replaced = false;

        const patchedFunction = this;
        this.replace = function(...args) {
            patchedFunction.call(this, arguments);
        };
        this.replace.__monkeyPatch = this;

        if (replaceOriginal)
            this.replaceOriginal();
    }

    addPatch(patch) {
        if (!this.patches.includes(patch))
            this.patches.push(patch);
    }

    removePatch(patch, restoreOriginal = true) {
        let i = 0;
        while (this.patches[i]) {
            if (this.patches[i] !== patch) i++;
            else this.patches.splice(i, 1);
        }

        if (!this.patches.length && restoreOriginal)
            this.restoreOriginal();
    }

    replaceOriginal() {
        if (this.replaced) return;
        this.object[this.methodName] = Object.assign(this.replace, this.object[this.methodName]);
        this.replaced = true;
    }

    restoreOriginal() {
        if (!this.replaced) return;
        this.object[this.methodName] = Object.assign(this.object[this.methodName], this.replace);
        this.replaced = false;
    }

    call(_this, args) {
        const data = {
            this: _this,
            arguments: args,
            return: undefined,
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
            };
        }

        data.callOriginalMethod();
        return data.return;
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

    call(data) {
        if (this.once)
            this.cancel();

        this.callBefore(data);
        this.callInstead(data);
        this.callAfter(data);
    }

    callBefore(data) {
        if (this.before)
            this.callHook('before', this.before, data);
    }

    callInstead(data) {
        if (this.instead)
            this.callHook('instead', this.instead, data);
        else data.callOriginalMethod();
    }

    callAfter(data) {
        if (this.after)
            this.callHook('after', this.after, data);
    }

    callHook(hook, f, data) {
        try {
            f.call(this, data, ...data.arguments);
        } catch (err) {
            Logger.log('MonkeyPatch', [`Error thrown in ${hook} hook of`, this, '- :', err]);
            if (!this.suppressErrors) throw err;
        }
    }

    cancel() {
        this.patchedFunction.removePatch(this);
    }
}
