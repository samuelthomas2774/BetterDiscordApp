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
        this.patchUserProfileModal();
    }

    get contributors() {
        return contributors;
    }

    /**
     * Patches Message to render profile badges.
     */
    async patchMessage() {
        const Message = await ReactComponents.getComponent('Message');

        this.unpatchMessageRender = MonkeyPatch('ProfileBadges', Message.component.prototype).after('render', (component, args, retVal) => {
            if (!retVal.props || !retVal.props.children) return;
            if (ReactHelpers.findProp(component, 'jumpSequenceId') && ReactHelpers.findProp(component, 'canFlash')) retVal = retVal.props.children;

            const message = ReactHelpers.findProp(component, 'message');
            if (!message || !message.author) return;
            const user = message.author;
            const c = contributors.find(c => c.id === user.id);
            if (!c) return;

            const username = ReactHelpers.findByProp(retVal, 'type', 'h2');
            if (!username) return;

            username.props.children.splice(1, 0, VueInjector.createReactElement({
                components: { BdMessageBadge },
                data: { c },
                template: '<BdMessageBadge :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />'
            }));
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
            const selector = '.' + WebpackModules.getModuleByProps(['member', 'memberInner', 'activity']).member;

            for (const channelMember of document.querySelectorAll(selector)) {
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
        const selector = '.' + WebpackModules.getModuleByProps(['nameTag', 'username', 'discriminator', 'ownerIcon']).nameTag;
        const NameTag = await ReactComponents.getComponent('NameTag', { selector });

        this.PatchedNameTag = class extends NameTag.component {
            render() {
                const retVal = NameTag.component.prototype.render.call(this, arguments);
                try {
                    if (!retVal.props || !retVal.props.children) return;

                    const user = ReactHelpers.findProp(this, 'user');
                    if (!user) return;
                    const c = contributors.find(c => c.id === user.id);
                    if (!c) return;

                    retVal.props.children.splice(1, 0, VueInjector.createReactElement({
                        components: { BdMessageBadge },
                        data: { c },
                        template: '<BdMessageBadge :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />'
                    }));
                } catch (err) {
                    Logger.err('ProfileBadges', ['Error thrown while rendering a NameTag', err]);
                }
                return retVal;
            }
        };

        // Rerender all channel members
        if (this.unpatchChannelMemberRender) {
            const selector = '.' + WebpackModules.getModuleByProps(['member', 'memberInner', 'activity']).member;

            for (const channelMember of document.querySelectorAll(selector)) {
                Reflection(channelMember).forceUpdate();
            }
        }

        return this.PatchedNameTag;
    }

    /**
     * Patches UserProfileModal to render profile badges.
     */
    async patchUserProfileModal() {
        this.UserProfileModal = await ReactComponents.getComponent('UserProfileModal');

        this.unpatchUserProfileModal = MonkeyPatch('ProfileBadges', this.UserProfileModal.component.prototype).after('renderBadges', (component, args, retVal, setRetVal) => {
            const user = ReactHelpers.findProp(component, 'user');
            if (!user) return;
            const c = contributors.find(c => c.id === user.id);
            if (!c) return;

            const element = VueInjector.createReactElement({
                components: { BdBadge },
                data: { c },
                template: '<BdBadge :developer="c.developer" :webdev="c.webdev" :contributor="c.contributor" />',
            });

            if (!retVal) {
                setRetVal(ReactHelpers.React.createElement('div', {
                    className: 'bd-profile-badges-wrap',
                    children: element
                }));
            } else retVal.props.children.splice(0, 0, element);
        });
    }

}
