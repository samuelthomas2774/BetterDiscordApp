/**
 * BetterDiscord Developer/Contributor Profile Badges
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EventListener, ReactComponents, ReactComponentHelpers as Helpers, MonkeyPatch } from 'modules';
import { ClientLogger as Logger } from 'common';
import DOM from './dom';
import { BdBadge, BdMessageBadge } from './components/bd';
import VueInjector from './vueinjector';
import contributors from '../data/contributors';

export default class extends EventListener {

    init() {
        this.patchChannelMember();
        this.patchNameTag();
    }

    bindings() {
        this.uiEvent = this.uiEvent.bind(this);
        this.messageBadge = this.messageBadge.bind(this);
        this.badges = this.badges.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'discord:MESSAGE_CREATE', callback: this.messageBadge },
            { id: 'discord:MESSAGE_UPDATE', callback: this.messageBadge },
            { id: 'server-switch', callback: this.badges },
            { id: 'channel-switch', callback: this.badges },
            { id: 'ui:loadedmore', callback: this.badges },
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
        VueInjector.inject(root, {
            components: { BdMessageBadge },
            data: { c },
            template: '<BdMessageBadge :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />'
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

    /**
     * Patches ChannelMember to use the extended NameTag.
     * This is because NameTag is also used in places we don't really want any badges.
     */
    async patchChannelMember() {
        const ChannelMember = await ReactComponents.getComponent('ChannelMember');

        this.unpatchChannelMemberRender = MonkeyPatch('ProfileBadges', ChannelMember.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;

            const user = Helpers.findProp(component, 'user');
            if (!user) return;
            const c = contributors.find(c => c.id === user.id);
            if (!c) return;

            const nameTag = retVal.props.children.props.children[1].props.children[0];
            nameTag.type = this.PatchedNameTag || nameTag.type;
        });
    }

    /**
     * Creates an extended NameTag component that renders message badges.
     */
    async patchNameTag() {
        if (this.PatchedNameTag) return this.PatchedNameTag;

        const ProfileBadges = this;
        const NameTag = await ReactComponents.getComponent('NameTag', {selector: '.nameTag-26T3kW'});

        return this.PatchedNameTag = class extends NameTag.component {
            render() {
                const retVal = NameTag.component.prototype.render.call(this, arguments);
                try {
                    if (!retVal.props || !retVal.props.children) return;

                    const user = Helpers.findProp(this, 'user');
                    if (!user) return;
                    const c = contributors.find(c => c.id === user.id);
                    if (!c) return;

                    retVal.props.children.push(ReactHelpers.React.createElement('span', {
                        className: 'bd-badge-outer',
                        'data-userid': user.id
                    }));
                } catch (err) {
                    Logger.err('ProfileBadges', ['Error thrown while rendering a NameTag', err]);
                }
                return retVal;
            }

            componentDidMount() {
                const element = Helpers.ReactDOM.findDOMNode(this);
                if (!element) return;
                ProfileBadges.injectMessageBadges(element);
            }

            componentDidUpdate() {
                const element = Helpers.ReactDOM.findDOMNode(this);
                if (!element) return;
                // ProfileBadges.injectMessageBadges(element);
            }
        };
    }

    injectMessageBadges(element) {
        for (const beo of element.getElementsByClassName('bd-badge-outer')) this.injectNameTagBadge(beo);
    }

    injectMessageBadge(root) {
        const { userid } = root.dataset;
        if (!userid) return;

        const c = contributors.find(c => c.id === userid);
        if (!c) return;

        VueInjector.inject(root, {
            components: { BdMessageBadge },
            data: { c },
            template: '<BdMessageBadge :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />'
        }, DOM.createElement('span'));
        root.classList.add('bd-has-badge');
    }

}
