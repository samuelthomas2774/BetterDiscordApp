/**
 * BetterDiscord axios wrapper
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import axios from 'axios';

export default class AxiosWrapper {

    static get axios() { return axios; }

    static get(url) { return axios.get(url) }

    static get github() {
        return this._github ? this._github : (
            this._github = {
                main: this.create('https://github.com'),
                api: this.create('https://api.github.com')
            }
        );
    }

    static get zl() {
        return this._zl ? this._zl : (this._zl = {
            api: this.create('https://zl', 1000, this.zlHeaders),
            cdn: this.create('https://zl', 1000, this.zlHeaders)
        });
    }

    static create(baseUrl, timeout = 1000, headers = null) {
        return axios.create({ baseURL: baseUrl, timeout, headers: headers ? headers : this.defaultHeaders });
    }

    static get defaultHeaders() {
        return {
            'User-Agent': 'BetterDiscordApp User'
        };
    }

    static get zlHeaders() {
        return {
            'User-Agent': 'BetterDiscordApp User',
            'X-ZL-Apikey': '1a20cce89a2dbd163fc9570f3246c20891e62b2818ada55f82fa3d1d96fa7ef4',
            'X-ZL-User': 'anonymous'
        }
    }

}
