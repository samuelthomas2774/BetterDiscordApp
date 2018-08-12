/**
 * BetterDiscord Cache Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/
const CACHE = [];
export default class Cache {

    static get cache() {
        return CACHE;
    }

    static push(where, data) {
        if (!this.cache[where]) this.cache[where] = [];
        this.cache[where].push(data);
    }

    static find(where, what) {
        if (!this.cache[where]) this.cache[where] = [];
        return this.cache[where].find(what);
    }

}
