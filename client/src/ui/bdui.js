/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Dom from './dom';
import Vue from './vue';
import VTooltip from 'v-tooltip';
import { BdSettingsWrapper } from './components';
import { Events, WebpackModules } from 'modules';
import { Utils } from 'common';

export default class {

    static initUiEvents() {
        //this.profilePopupModule.open
        const defer = setInterval(() => {
            if (!this.profilePopupModule) return;
            clearInterval(defer);
            this.profilePopupModule.open = Utils.overload(this.profilePopupModule.open, userid => {
                Events.emit('ui-event', {
                    event: 'profile-popup-open',
                    data: { userid }
                });
            });
        }, 100);
        
    }

    static get profilePopupModule() {
        return WebpackModules.getModuleByProps(['fetchMutualFriends', 'setSection']);
    }

    static injectUi() {
        Dom.createElement('bdtooltips').appendTo(Dom.bdBody);

        Dom.createElement('div', null, 'bd-settings').appendTo(Dom.bdBody);

        const vueInstance = new Vue({
            el: '#bd-settings',
            components: { BdSettingsWrapper },
            template: '<BdSettingsWrapper/>'
        });

        return vueInstance;
    }
}
