/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Dom from './dom';
import Vue from 'vue';
import { BdSettingsWrapper } from './components';

export default class {
    static injectUi() {

        Dom.createElement('div', null, 'bd-settings').appendTo(Dom.bdBody);

        const vueInstance = new Vue({
            el: '#bd-settings',
            components: { BdSettingsWrapper },
            template: '<BdSettingsWrapper/>'
        });
    }
}