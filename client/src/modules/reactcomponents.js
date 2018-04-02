/**
 * BetterDiscord React Component Manipulations
 * original concept and some code by samogot - https://github.com/samogot / https://github.com/samogot/betterdiscord-plugins/tree/master/v2/1Lib%20Discord%20Internals
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { EmoteModule } from 'builtin';
import { Reflection } from 'ui';
import { ClientLogger as Logger } from 'common';
import { MonkeyPatch, Patcher } from './patcher';
import { WebpackModules, Filters } from './webpackmodules';
import DiscordApi from './discordapi';

class Helpers {
    static get plannedActions() {
        return this._plannedActions || (this._plannedActions = new Map());
    }

    static recursiveArray(parent, key, count = 1) {
        let index = 0;
        function* innerCall(parent, key) {
            const item = parent[key];
            if (item instanceof Array) {
                for (const subKey of item.keys()) {
                    yield* innerCall(item, subKey)
                }
                return;
            }
            yield { item, parent, key, index: index++, count };
        }

        return innerCall(parent, key);
    }

    static recursiveArrayCount(parent, key) {
        let count = 0;
        // eslint-disable-next-line no-empty-pattern
        for (let {} of this.recursiveArray(parent, key))
            ++count;
        return this.recursiveArray(parent, key, count);
    }

    static get recursiveChildren() {
        return function* (parent, key, index = 0, count = 1) {
            const item = parent[key];
            yield { item, parent, key, index, count };
            if (item && item.props && item.props.children) {
                for (let { parent, key, index, count } of this.recursiveArrayCount(item.props, 'children')) {
                    yield* this.recursiveChildren(parent, key, index, count);
                }
            }
        }
    }

    static returnFirst(iterator, process) {
        for (let child of iterator) {
            const retVal = process(child);
            if (retVal !== undefined) return retVal;
        }
    }

    static getFirstChild(rootParent, rootKey, selector) {
        const getDirectChild = (item, selector) => {
            if (item && item.props && item.props.children) {
                return this.returnFirst(this.recursiveArrayCount(item.props, 'children'), checkFilter.bind(null, selector));
            }
        };
        const checkFilter = (selector, { item, parent, key, count, index }) => {
            let match = true;
            if (match && selector.type)
                match = item && selector.type === item.type;
            if (match && selector.tag)
                match = item && typeof item.type === 'string' && selector.tag === item.type;
            if (match && selector.className) {
                match = item && item.props && typeof item.props.className === 'string';
                if (match) {
                    const classes = item.props.className.split(' ');
                    if (selector.className === true)
                        match = !!classes[0];
                    else if (typeof selector.className === 'string')
                        match = classes.includes(selector.className);
                    else if (selector.className instanceof RegExp)
                        match = !!classes.find(cls => selector.className.test(cls));
                    else match = false;
                }
            }
            if (match && selector.text) {
                if (selector.text === true)
                    match = typeof item === 'string';
                else if (typeof selector.text === 'string')
                    match = item === selector.text;
                else if (selector.text instanceof RegExp)
                    match = typeof item === 'string' && selector.text.test(item);
                else match = false;
            }
            if (match && selector.nthChild)
                match = index === (selector.nthChild < 0 ? count + selector.nthChild : selector.nthChild);
            if (match && selector.hasChild)
                match = getDirectChild(item, selector.hasChild);
            if (match && selector.hasSuccessor)
                match = item && !!this.getFirstChild(parent, key, selector.hasSuccessor).item;
            if (match && selector.eq) {
                --selector.eq;
                return;
            }
            if (match) {
                if (selector.child) {
                    return getDirectChild(item, selector.child);
                }
                else if (selector.successor) {
                    return this.getFirstChild(parent, key, selector.successor);
                }
                else {
                    return { item, parent, key };
                }
            }
        };
        return this.returnFirst(this.recursiveChildren(rootParent, rootKey), checkFilter.bind(null, selector)) || {};
    }

    static parseSelector(selector) {
        if (selector.startsWith('.')) return { className: selector.substr(1) }
        if (selector.startsWith('#')) return { id: selector.substr(1) }
        return {}
    }

    static findByProp(obj, what, value) {
        if (obj.hasOwnProperty(what) && obj[what] === value) return obj;
        if (obj.props && !obj.children) return this.findByProp(obj.props, what, value);
        if (!obj.children || !obj.children.length) return null;
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findByProp(child, what, value);
            if (findInChild) return findInChild;
        }
        return null;
    }

    static findProp(obj, what) {
        if (obj.hasOwnProperty(what)) return obj[what];
        if (obj.props && !obj.children) return this.findProp(obj.props, what);
        if (!obj.children) return null;
        if (!(obj.children instanceof Array)) return this.findProp(obj.children, what);
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findProp(child, what);
            if (findInChild) return findInChild;
        }
        return null;
    }

    static get React() {
        return WebpackModules.getModuleByName('React');
    }

    static get ReactDOM() {
        return WebpackModules.getModuleByName('ReactDOM');
    }
}

export { Helpers as ReactHelpers };

class ReactComponent {
    constructor(id, component, retVal) {
        this._id = id;
        this._component = component;
        this._retVal = retVal;
    }

    get id() {
        return this._id;
    }

    get component() {
        return this._component;
    }

    get retVal() {
        return this._retVal;
    }
}

export class ReactComponents {
    static get components() { return this._components || (this._components = []) }
    static get unknownComponents() { return this._unknownComponents || (this._unknownComponents = []) }
    static get listeners() { return this._listeners || (this._listeners = []) }
    static get nameSetters() { return this._nameSetters || (this._nameSetters = []) }

    static push(component, retVal) {
        if (!(component instanceof Function)) return null;
        const { displayName } = component;
        if (!displayName) {
            return this.processUnknown(component, retVal);
        }
        const have = this.components.find(comp => comp.id === displayName);
        if (have) return component;
        const c = new ReactComponent(displayName, component, retVal);
        this.components.push(c);
        const listener = this.listeners.find(listener => listener.id === displayName);
        if (!listener) return c;
        for (const l of listener.listeners) {
            l(c);
        }
        this.listeners.splice(this.listeners.findIndex(listener => listener.id === displayName), 1);
        return c;
    }

    static async getComponent(name, important) {
        const have = this.components.find(c => c.id === name);
        if (have) return have;
        if (important) {
            const importantInterval = setInterval(() => {
                if (this.components.find(c => c.id === name)) {
                    Logger.info('ReactComponents', `Important component ${name} already found`);
                    clearInterval(importantInterval);
                    return;
                }
                const select = document.querySelector(important.selector);
                if (!select) return;
                const reflect = Reflection(select);
                if (!reflect.component) {
                    clearInterval(importantInterval);
                    Logger.error('ReactComponents', [`FAILED TO GET IMPORTANT COMPONENT ${name} WITH REFLECTION FROM`, select]);
                    return;
                }
                if (!reflect.component.displayName) reflect.component.displayName = name;
                Logger.info('ReactComponents', [`Found important component ${name} with reflection`, reflect]);
                this.push(reflect.component);
                clearInterval(importantInterval);
            }, 50);
        }
        const listener = this.listeners.find(l => l.id === name);
        if (!listener) this.listeners.push({
            id: name,
            listeners: []
        });
        return new Promise(resolve => {
            this.listeners.find(l => l.id === name).listeners.push(resolve);
        });
    }

    static setName(name, filter, callback) {
        const have = this.components.find(c => c.id === name);
        if (have) return have;

        for (const [rci, rc] of this.unknownComponents.entries()) {
            if (filter(rc.component)) {
                rc.component.displayName = name;
                this.unknownComponents.splice(rci, 1);
                return this.push(rc.component);
            }
        }
        return this.nameSetters.push({ name, filter });
    }

    static processUnknown(component, retVal) {
        const have = this.unknownComponents.find(c => c.component === component);
        for (const [fi, filter] of this.nameSetters.entries()) {
            if (filter.filter.filter(component)) {
                console.log('filter match!');
                component.displayName = filter.name;
                this.nameSetters.splice(fi, 1);
                return this.push(component, retVal);
            }
        }
        if (have) return have;
        this.unknownComponents.push(component);
        return component;
    }
}

export class ReactAutoPatcher {
    static async autoPatch() {
        await this.ensureReact();
        this.React = {};
        this.React.unpatchCreateElement = MonkeyPatch('BD:ReactComponents:createElement', 'React').before('createElement', (component, args) => {
            ReactComponents.push(args[0]);
        });
        this.patchComponents();
        return 1;
    }

    static async ensureReact() {
        while (!window.webpackJsonp || !WebpackModules.getModuleByName('React')) await new Promise(resolve => setTimeout(resolve, 10));
        return 1;
    }

    static async patchComponents() {
        await this.patchMessage();
        await this.patchMessageGroup();
        await this.patchChannelMember();
        await this.patchGuild();
        await this.patchChannel();
        await this.patchChannelList();
        this.forceUpdate();
    }

    static async patchMessage() {
        this.Message = await ReactComponents.getComponent('Message', { selector: '.message' });
        this.unpatchMessageRender = MonkeyPatch('BD:ReactComponents', this.Message.component.prototype).after('render', (component, args, retVal) => {
            const { message } = component.props;
            const { id, colorString, bot, author, attachments, embeds } = message;
            retVal.props['data-message-id'] = id;
            retVal.props['data-colourstring'] = colorString;
            if (author && author.id) retVal.props['data-user-id'] = author.id;
            if (bot || (author && author.bot)) retVal.props.className += ' bd-isBot';
            if (attachments && attachments.length) retVal.props.className += ' bd-hasAttachments';
            if (embeds && embeds.length) retVal.props.className += ' bd-hasEmbeds';
            if (author && author.id === DiscordApi.currentUser.id) retVal.props.className += ' bd-isCurrentUser';
        });
    }

    static async patchMessageGroup() {
        this.MessageGroup = await ReactComponents.getComponent('MessageGroup', { selector: '.message-group' });
        this.unpatchMessageGroupRender = MonkeyPatch('BD:ReactComponents', this.MessageGroup.component.prototype).after('render', (component, args, retVal) => {
            const { author, type } = component.props.messages[0];
            retVal.props['data-author-id'] = author.id;
            if (author.id === DiscordApi.currentUser.id) retVal.props.className += ' bd-isCurrentUser';
            if (type !== 0) retVal.props.className += ' bd-isSystemMessage';
        });
    }

    static async patchChannelMember() {
        this.ChannelMember = await ReactComponents.getComponent('ChannelMember', { selector: '.member-2FrNV0' });
        this.unpatchChannelMemberRender = MonkeyPatch('BD:ReactComponents', this.ChannelMember.component.prototype).after('render', (component, args, retVal) => {
            // Logger.log('ReactComponents', ['Rendering ChannelMember', component, args, retVal]);
            if (!retVal.props || !retVal.props.children) return;
            const user = Helpers.findProp(component, 'user');
            if (!user) return;
            retVal.props['data-user-id'] = user.id;
        });
    }

    static async patchGuild() {
        this.Guild = await ReactComponents.getComponent('Guild');
        this.unpatchGuild = MonkeyPatch('BD:ReactComponents', this.Guild.component.prototype).after('render', (component, args, retVal) => {
            const { guild } = component.props;
            if (!guild) return;
            retVal.props['data-guild-id'] = guild.id;
            retVal.props['data-guild-name'] = guild.name;
        });
    }

    static async patchChannel() {
        this.Channel = await ReactComponents.getComponent('Channel');
        this.unpatchChannel = MonkeyPatch('BD:ReactComponents', this.Channel.component.prototype).after('render', (component, args, retVal) => {
            const channel = component.props.channel || component.state.channel;
            if (!channel) return;
            retVal.props['data-channel-id'] = channel.id;
            retVal.props['data-channel-name'] = channel.name;
        });
    }

    static async patchChannelList() {
        this.GuildChannel = await ReactComponents.getComponent('GuildChannel', { selector: '.containerDefault-7RImuF' });
        this.unpatchGuildChannel = MonkeyPatch('BD:ReactComponents', this.GuildChannel.component.prototype).after('render', (component, args, retVal) => {
            const { channel } = component.props;
            if (!channel) return;
            retVal.props['data-channel-id'] = channel.id;
            retVal.props['data-channel-name'] = channel.name;
        });
    }

    static forceUpdate() {
        for (const e of document.querySelectorAll('.message, .message-group, .guild, .containerDefault-7RImuF, .channel-members .member-2FrNV0')) {
            Reflection(e).forceUpdate();
        }
    }
}
