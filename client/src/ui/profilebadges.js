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
import { BdBadge, BdMessageBadge } from './components/bd';
import VueInjector from './vueinjector';
import contributors from '../data/contributors';

export default class extends EventListener {

    bindings() {
        this.uiEvent = this.uiEvent.bind(this);
        this.messageBadge = this.messageBadge.bind(this);
        this.badges = this.badges.bind(this);
        this.userlistBadge = this.userlistBadge.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'discord:MESSAGE_CREATE', callback: this.messageBadge },
            { id: 'discord:MESSAGE_UPDATE', callback: this.messageBadge },
            { id: 'server-switch', callback: this.badges },
            { id: 'channel-switch', callback: this.badges },
            { id: 'ui:loadedmore', callback: this.badges },
            { id: 'ui:useridset', callback: this.userlistBadge },
            { id: 'ui-event', callback: this.uiEvent }
        ];
    }

    uiEvent(e) {
        const { event, data } = e;
        if (event !== 'profile-popup-open') return;
        const { userid } = data;
        if (!userid) return;

        this.inject(userid);
    }

    badges() {
        for (const messageGroup of document.querySelectorAll('.message-group')) {
            this.messageBadge({ element: messageGroup });
        }
    }

    messageBadge(e) {
        if (!e.element) return;
        const msgGroup = e.element.closest('.message-group');
        if (msgGroup.dataset.hasBadges) return;
        msgGroup.setAttribute('data-has-badges', true);
        if (!msgGroup.dataset.authorId) return;
        const c = contributors.find(c => c.id === msgGroup.dataset.authorId);
        if (!c) return;
        const root = document.createElement('span');
        const usernameWrapper = msgGroup.querySelector('.username-wrapper');
        if (!usernameWrapper) return;
        const wrapperParent = usernameWrapper.parentElement;
        if (!wrapperParent || wrapperParent.children.length < 2) return;
        wrapperParent.insertBefore(root, wrapperParent.children[1]);
        const { developer, contributor, webdev } = c;
        VueInjector.inject(root, {
            components: { BdMessageBadge },
            data: { developer, contributor, webdev },
            template: '<BdMessageBadge :developer="developer" :webdev="webdev" :contributor="contributor" />'
        });
    }

    userlistBadge(e) {
        const c = contributors.find(c => c.id === e.dataset.userId);
        if (!c) return;
        const memberUsername = e.querySelector('.member-username');
        if (!memberUsername) return;
        const root = document.createElement('span');
        memberUsername.append(root);
        const { developer, contributor, webdev } = c;
        VueInjector.inject(root, {
            components: { BdMessageBadge },
            data: { developer, contributor, webdev },
            template: '<BdMessageBadge :developer="developer" :webdev="webdev" :contributor="contributor" />'
        });
    }

    inject(userid) {
        const c = contributors.find(c => c.id === userid);
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

            VueInjector.inject(root, {
                components: { BdBadge },
                data: { hasBadges, c },
                template: '<BdBadge :hasBadges="hasBadges" :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />',
            }, DOM.createElement('div', null, 'bdprofilebadges'));
        }, 400);
    }

    get contributors() {
        return contributors;
    }

}
