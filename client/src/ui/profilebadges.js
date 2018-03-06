/**
 * BetterDiscord Developer/Contributor Profile Badges
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EventListener } from 'modules';
import DOM from './dom';
import { BdBadge } from './components/bd';
import VueInjector from './vueinjector';

export default class extends EventListener {

    bindings() {
        this.uiEvent = this.uiEvent.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'ui-event', callback:  this.uiEvent }
        ];
    }

    uiEvent(e) {
        const { event, data } = e;
        if (event !== 'profile-popup-open') return;
        const { userid } = data;
        if (!userid) return;

        this.inject(userid);
    }

    inject(userid) {
        const c = this.contributors.find(c => c.id === userid);
        if (!c) return;

        setTimeout(() => {
            let hasBadges = false;
            let root = document.querySelector('[class*="profileBadges"]');
            if (root) {
                hasBadges = true;
            } else {
                root = document.querySelector('[class*="headerInfo"]');
            }

            const { developer, contributor, webdev } = c;

            VueInjector.inject(
                root,
                DOM.createElement('div', null, 'bdprofilebadges'),
                { BdBadge },
                `<BdBadge hasBadges="${hasBadges}" developer="${developer}" webdev="${webdev}" contributor="${contributor}"/>`
            );
        }, 400);
    }

    get contributors() {
        return [
            { 'id': '81388395867156480', 'webdev': true, 'developer': true, 'contributor': true }, // Jiiks
            { 'id': '98003542823944192', 'webdev': false, 'developer': true, 'contributor': true }, // Pohky
            { 'id': '138850472541814784', 'webdev': true, 'developer': false, 'contributor': true }, // Hammock
            { 'id': '249746236008169473', 'webdev': false, 'developer': true, 'contributor': true }, // Zerebos
            { 'id': '125367412370440192', 'webdev': false, 'developer': true, 'contributor': true }, // Pierce
            { 'id': '284056145272766465', 'webdev': false, 'developer': false, 'contributor': true }, // Samuel Elliott
            { 'id': '184021060562321419', 'webdev': false, 'developer': false, 'contributor': true }, // Lilian Tedone
            { 'id': '76052829285916672', 'webdev': false, 'developer': false, 'contributor': true }, // samfun123
            { 'id': '171005991272316937', 'webdev': false, 'developer': false, 'contributor': true }, // samogot
        ];
    }

}
