/**
 * BetterDiscord Vendor Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { WebpackModules } from './webpackmodules';
import jQuery from 'jquery';
import lodash from 'lodash';
import Vue from 'vue';

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
     * Moment
     */
    static get moment() {
        return WebpackModules.getModuleByName('Moment');
    }

    /**
     * Vue
     */
    static get Vue() {
        return Vue;
    }

}
