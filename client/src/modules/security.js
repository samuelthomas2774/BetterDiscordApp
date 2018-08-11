/**
 * BetterDiscord Security Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import aes256 from 'aes256';

export default class Security {

    static encrypt(key, content, prefix = '') {
        if (key instanceof Array) return this.deepDecrypt(key, content, prefix);
        return `${prefix}${aes256.encrypt(key, content)}`;
    }

    static deepDecrypt(keys, content, prefix = '') {
        let decrypt = null;
        for (const key of keys.reverse()) {
            if (decrypt === null) decrypt = this.decrypt(key, content, prefix);
            else decrypt = this.decrypt(key, decrypt, prefix);
        }
        return decrypt;
    }

    static decrypt(key, content, prefix = '') {
        if (key instanceof Array) return this.deepDecrypt(key, content, prefix);
        return aes256.decrypt(key, content.replace(prefix, ''));
    }

    static deepEncrypt(keys, content, prefix = '') {
        let encrypt = null;
        for (const key of keys) {
            if (encrypt === null) encrypt = this.encrypt(key, content, prefix);
            else encrypt = this.encrypt(key, encrypt, prefix);
        }
        return encrypt;
    }

}
