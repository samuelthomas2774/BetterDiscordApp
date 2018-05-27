/**
 * BetterDiscord Developer/Contributor Profile Badges
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Module, ReactComponents, ReactHelpers, MonkeyPatch, WebpackModules } from 'modules';
import { Reflection } from 'ui';
import { Utils, ClientLogger as Logger } from 'common';
import DOM from './dom';
import { BdBadge, BdMessageBadge } from './components/bd';
import VueInjector from './vueinjector';
import contributors from '../data/contributors';

export default class extends Module {

    init() {
        this.patchMessage();
        this.patchChannelMember();
        this.patchNameTag();
        this.patchUserProfileModals();
    }

    get contributors() {
        return contributors;
    }

    /**
     * Patches Message to use the extended NameTag.
     * This is because NameTag is also used in places we don't really want any badges.
     */
    async patchMessage() {
        const Message = await ReactComponents.getComponent('Message');

        this.unpatchMessageRender = MonkeyPatch('ProfileBadges', Message.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;

            const message = ReactHelpers.findProp(component, 'message');
            if (!message || !message.author) return;
            const user = message.author;
            const c = contributors.find(c => c.id === user.id);
            if (!c) return;

            const username = ReactHelpers.findByProp(retVal, 'type', 'h2');
            if (!username) return;
            username.props.children.splice(1, 0, ReactHelpers.React.createElement('span', {
                className: 'bd-badge-outer',
                'data-userid': user.id
            }));
        });

        this.unpatchMessageMount = MonkeyPatch('ProfileBadges', Message.component.prototype).after('componentDidMount', component => {
            const element = ReactHelpers.ReactDOM.findDOMNode(component);
            if (!element) return;
            this.injectMessageBadges(element);
        });

        this.unpatchMessageUpdate = MonkeyPatch('ProfileBadges', Message.component.prototype).after('componentDidUpdate', component => {
            const element = ReactHelpers.ReactDOM.findDOMNode(component);
            if (!element) return;
            this.injectMessageBadges(element);
        });

        // Rerender all messages
        for (const message of document.querySelectorAll('.message')) {
            Reflection(message).forceUpdate();
        }
    }

    /**
     * Patches ChannelMember to use the extended NameTag.
     * This is because NameTag is also used in places we don't really want any badges.
     */
    async patchChannelMember() {
        const ChannelMember = await ReactComponents.getComponent('ChannelMember');

        this.unpatchChannelMemberRender = MonkeyPatch('ProfileBadges', ChannelMember.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;

            const user = ReactHelpers.findProp(component, 'user');
            if (!user) return;
            const c = contributors.find(c => c.id === user.id);
            if (!c) return;

            const nameTag = retVal.props.children.props.children[1].props.children[0];
            nameTag.type = this.PatchedNameTag || nameTag.type;
        });

        // Rerender all channel members
        if (this.PatchedNameTag) {
            for (const channelMember of document.querySelectorAll('.member-2FrNV0')) {
                Reflection(channelMember).forceUpdate();
            }
        }
    }

    /**
     * Creates an extended NameTag component that renders message badges.
     */
    async patchNameTag() {
        if (this.PatchedNameTag) return this.PatchedNameTag;

        const ProfileBadges = this;
        const NameTag = await ReactComponents.getComponent('NameTag', {selector: '.nameTag-26T3kW'});

        this.PatchedNameTag = class extends NameTag.component {
            render() {
                const retVal = NameTag.component.prototype.render.call(this, arguments);
                try {
                    if (!retVal.props || !retVal.props.children) return;

                    const user = ReactHelpers.findProp(this, 'user');
                    if (!user) return;
                    const c = contributors.find(c => c.id === user.id);
                    if (!c) return;

                    retVal.props.children.splice(1, 0, ReactHelpers.React.createElement('span', {
                        className: 'bd-badge-outer',
                        'data-userid': user.id
                    }));
                } catch (err) {
                    Logger.err('ProfileBadges', ['Error thrown while rendering a NameTag', err]);
                }
                return retVal;
            }

            componentDidMount() {
                const element = ReactHelpers.ReactDOM.findDOMNode(this);
                if (!element) return;
                ProfileBadges.injectMessageBadges(element);
            }

            componentDidUpdate() {
                const element = ReactHelpers.ReactDOM.findDOMNode(this);
                if (!element) return;
                ProfileBadges.injectMessageBadges(element);
            }
        };

        // Rerender all channel members
        if (this.unpatchChannelMemberRender) {
            for (const channelMember of document.querySelectorAll('.member-2FrNV0')) {
                Reflection(channelMember).forceUpdate();
            }
        }

        return this.PatchedNameTag;
    }

    injectMessageBadges(element) {
        for (const beo of element.getElementsByClassName('bd-badge-outer'))
            this.injectMessageBadge(beo);
    }

    injectMessageBadge(root) {
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

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

    /**
     * Patches UserProfileModals to inject profile badges into the modal once opened.
     * TODO: just patch the modal component
     */
    async patchUserProfileModals() {
        const UserProfileModals = WebpackModules.getModuleByName('UserProfileModals');

        MonkeyPatch('BdUI', UserProfileModals).after('open', async (context, [userid]) => {
            const c = contributors.find(c => c.id === userid);
            if (!c) return;

            const root = await Utils.until(() => document.querySelector('[class*="headerInfo"]'));
            const el = DOM.createElement('div', null, 'bdprofilebadges');
            root.insertBefore(el.element, root.firstChild.nextSibling);

            this.injectProfileBadge(userid, el.element);
        });
    }

    injectProfileBadge(userid, root) {
        const c = contributors.find(c => c.id === userid);
        if (!c) return;

        VueInjector.inject(root, {
            components: { BdBadge },
            data: { c },
            template: '<BdBadge :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />',
        });
    }

}
