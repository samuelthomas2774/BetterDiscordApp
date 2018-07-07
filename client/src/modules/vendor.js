/**
 * BetterDiscord Vendor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import jQuery from 'jquery';
import lodash from 'lodash';
import Vue from 'vue';

import axios from 'axios';
import axiosHttpAdapter from 'axios/lib/adapters/http';

axios.defaults.adapter = axiosHttpAdapter;

import Combokeys from 'combokeys';
import filetype from 'file-type';
import filewatcher from 'filewatcher';
import VTooltip from 'v-tooltip';

export { jQuery as $ };

export default class {

    /**
     * jQuery
     */
    static get jQuery() { return jQuery }
    static get $() { return this.jQuery }

    /**
     * Lodash
     */
    static get lodash() { return lodash }
    static get _() { return this.lodash }

    /**
     * Vue
     */
    static get Vue() { return Vue }

    static get axios() { return axios }

    static get Combokeys() { return Combokeys }
    static get filetype() { return filetype }
    static get filewatcher() { return filewatcher }
    static get VTooltip() { return VTooltip }

}
