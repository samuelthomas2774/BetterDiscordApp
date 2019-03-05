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

    static get github() {
        return this._github ? this._github : (
            this._github = {
                main: this.create('https://github.com'),
                api: this.create('https://api.github.com')
            }
        );
    }

    static create(baseUrl, timeout = 1000, headers = null) {
        return axios.create({ baseURL: baseUrl, timeout, headers: headers ? headers : this.defaultHeaders });
    }

    static get defaultHeaders() {
        return {};
    }

}
