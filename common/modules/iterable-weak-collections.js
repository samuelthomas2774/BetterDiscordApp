/**
 * BetterDiscord Iterable Weak Collections
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import process from 'process';

export class IterableWeakMap extends WeakMap {
    [Symbol.iterator]() {
        return this.entries();
    }

    entries() {
        return IterableWeakCollections.getWeakMapEntries(this).values();
    }

    keys() {
        return IterableWeakCollections.getWeakMapEntries(this).map(e => e[0]).values();
    }

    values() {
        return IterableWeakCollections.getWeakMapEntries(this).map(e => e[1]).values();
    }

    forEach(callback, thisArg) {
        for (let [key, value] of this) {
            callback.call(thisArg, value, key, this);
        }
    }

    clear() {
        for (let key of this.keys()) {
            this.delete(key);
        }
    }

    get size() {
        return IterableWeakCollections.getWeakMapEntries(this).length;
    }

    get [Symbol.toStringTag]() {
        return 'IterableWeakMap';
    }

    static get [Symbol.species]() {
        return IterableWeakMap;
    }
}

export class IterableWeakSet extends WeakSet {
    [Symbol.iterator]() {
        return this.values();
    }

    values() {
        return IterableWeakCollections.getWeakSetValues(this).values();
    }

    forEach(callback, thisArg) {
        for (let value of this) {
            callback.call(thisArg, value, value, this);
        }
    }

    clear() {
        for (let value of this) {
            this.delete(value);
        }
    }

    get size() {
        return IterableWeakCollections.getWeakSetValues(this).length;
    }

    static get [Symbol.species]() {
        return IterableWeakSet;
    }
}

export class IterableWeakCollections {

    /**
     * Returns a WeakMap's entries.
     * @param {WeakMap} weakmap
     * @return {Array}
     */
    static getWeakMapEntries(wm) {
        const keysAndValues = this._getWeakMapEntries(wm);
        const entries = [];

        while (keysAndValues.length) {
            const key = keysAndValues.shift();
            const value = keysAndValues.shift();

            entries.push([key, value]);
        }

        return entries;
    }

    static mapFromWeakMap(wm) {
        return new Map(this.getWeakMapEntries(wm));
    }

    /**
     * Returns a WeakSet's values.
     * @param {WeakSet} weakset
     * @return {Array}
     */
    static getWeakSetValues(ws) {
        return this._getWeakSetValues(ws);
    }

    static setFromWeakSet(ws) {
        return new Set(this.getWeakSetValues(ws));
    }

    static _init() {
        this._natives_syntax = process.execArgv.some(s => /^--allow[-_]natives[-_]syntax$/.test(s));

        // Use eval otherwise webpack will throw a syntax error
        // eslint-disable-next-line no-eval
        this._getWeakMapEntries = eval(`this._callWithNativesSyntax.bind(this, function (wm, max) {
            // Retrieve all WeakMap instance key / value pairs up to \`max\`. \`max\` limits the
            // number of key / value pairs returned. Make sure it is a positive number,
            // otherwise V8 aborts. Passing through \`0\` returns all elements.
            if (!(wm instanceof WeakMap)) throw new Error('weakmap must be an instance of WeakMap');
            return %GetWeakMapEntries(wm, typeof max === 'number' && max > 0 ? max : 0);
        }, this)`);

        // eslint-disable-next-line no-eval
        this._getWeakSetValues = eval(`this._callWithNativesSyntax.bind(this, function (ws, max) {
            // Retrieve all WeakSet instance values up to \`max\`. \`max\` limits the
            // number of values returned. Make sure it is a positive number,
            // otherwise V8 aborts. Passing through \`0\` returns all elements.
            if (!(ws instanceof WeakSet)) throw new Error('weakset must be an instance of WeakSet');
            return %GetWeakSetValues(ws, typeof max === 'number' && max > 0 ? max : 0);
        }, this)`);
    }

    static _callWithNativesSyntax(f, bind, ...args) {
        const v8 = process.binding('v8');

        // Enable natives syntax
        v8.setFlagsFromString('--allow_natives_syntax');

        try {
            const r = f.apply(bind, args);

            // Disable --allow_natives_syntax again unless it was explicitly
            // specified on the command line
            if (!this._natives_syntax) v8.setFlagsFromString('--noallow_natives_syntax');

            return r;
        } catch (err) {
            // Disable --allow_natives_syntax again unless it was explicitly
            // specified on the command line
            if (!this._natives_syntax) v8.setFlagsFromString('--noallow_natives_syntax');

            throw err;
        }
    }

}

IterableWeakCollections._callWithNativesSyntax(IterableWeakCollections._init, IterableWeakCollections);
