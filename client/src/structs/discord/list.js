/**
 * BetterDiscord Discord API List Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export class List extends Array {

    get(...filters) {
        return this.find(item => {
            for (let filter of filters) {
                for (let key in filter) {
                    if (item[key] !== filter[key]) return false;
                }
            }
            return true;
        });
    }

    static from(array, map) {
        const list = new List();
        for (let key in array) {
            const value = array[key];

            list.push(map ? map(value) : value);
        }
        return list;
    }

}
