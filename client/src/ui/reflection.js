/**
 * BetterDiscord Reflection Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export default class {
    static reactInternalInstance(node) {
        if (!Object.keys(node) || !Object.keys(node).length) return null;
        const riiKey = Object.keys(node).find(k => k.startsWith('__reactInternalInstance'));
        return riiKey ? node[riiKey] : null;
    }

    static findProp(node, prop) {
        const ii = this.reactInternalInstance(node);
        if (!ii) return null;
        const fir = this.findInReturn(ii, prop);
        if (fir) return fir;
        return null;
    }

    static findInReturn(internalInstance, prop) {
        const r = internalInstance.return;
        if (!r) return null;
        const find = this.findMemoizedProp(r, prop);
        if (find) return find;
        return this.findMemoizedState(r, prop);
    }

    static findMemoizedProp(obj, prop) {
        if (!obj.hasOwnProperty('memoizedProps')) return null;
        obj = obj.memoizedProps;
        return this.findPropIn(obj, prop);
    }

    static findMemoizedState(obj, prop) {
        if (!obj.hasOwnProperty('memoizedState')) return null;
        obj = obj.memoizedState;
        return this.findPropIn(obj, prop);
    }

    static findPropIn(obj, prop) {
        if (obj && !(obj instanceof Array) && obj instanceof Object && obj.hasOwnProperty(prop)) return obj[prop];
        if (obj && obj instanceof Array) {
            const found = obj.find(mp => {
                if (mp.props && mp.props.hasOwnProperty(prop)) return true;
            });
            if (found) return found;
        }
        return null;
    }
}
