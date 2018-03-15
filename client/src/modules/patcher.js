/**
 * BetterDiscord Component Patcher
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

import WebpackModules from './webpackmodules';
import { ClientLogger as Logger } from 'common';

export default class Patcher {
    static get patches() { return this._patches || (this._patches = {}) }
    static resolveModule(mn) {
        if (mn instanceof Function || (mn instanceof Object && !(mn instanceof Array))) return mn;
        if ('string' === typeof mn) return WebpackModules.getModuleByName(mn);
        if (mn instanceof Array) return WebpackModules.getModuleByProps(mn);
        return null;
    }
    static overrideFn(patch) {
        return function () {
            for (const s of patch.supers) {
                try {
                    s.fn.apply(this, arguments);
                } catch (err) {
                    Logger.err('Patcher', err);
                }
            }
            const retVal = patch.ofn.apply(this, arguments);
            for (const s of patch.slaves) {
                try {
                    s.fn.apply(this, [arguments, { patch, retVal }]);
                } catch (err) {
                    Logger.err('Patcher', err);
                }
            }
            return retVal;
        }
    }

    static rePatch(po) {
        po.patch = po.module[po.fnn] = this.overrideFn(po);
    }

    static pushPatch(id, module, fnn) {
        const patch = {
            module,
            fnn,
            ofn: module[fnn],
            revert: () => {
                patch.module[patch.fnn] = patch.ofn;
                patch.patch = null;
                patch.slaves = patch.supers = [];
            },
            supers: [],
            slaves: [],
            patch: null
        };
        patch.patch = module[fnn] = this.overrideFn(patch);
        return this.patches[id] = patch;
    }

    static superpatch(mn, fnn, cb, dn) {
        const module = this.resolveModule(mn);
        if (!module || !module[fnn] || !(module[fnn] instanceof Function)) return null;
        const displayName = 'string' === typeof mn ? mn  : dn || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}:${fnn}`;
        const patchObject = this.patches[patchId] || this.pushPatch(patchId, module, fnn);
        if (!patchObject.patch) this.rePatch(patchObject);
        const id = patchObject.supers.length + 1;
        const patch = {
            id,
            fn: cb,
            unpatch: () => patchObject.supers.splice(patchObject.supers.findIndex(slave => slave.id === id), 1)
        };
        patchObject.supers.push(patch);
        return patch;
    }

    static slavepatch(mn, fnn, cb, dn) {
        const module = this.resolveModule(mn);
        if (!module || !module[fnn] || !(module[fnn] instanceof Function)) return null;
        const displayName = 'string' === typeof mn ? mn : dn || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}:${fnn}`;
        const patchObject = this.patches[patchId] || this.pushPatch(patchId, module, fnn);
        if (!patchObject.patch) this.rePatch(patchObject);
        const id = patchObject.slaves.length + 1;
        const patch = {
            id,
            fn: cb,
            unpatch: () => patchObject.slaves.splice(patchObject.slaves.findIndex(slave => slave.id === id), 1)
        };
        patchObject.slaves.push(patch);
        return patch;
    }
}
