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

import Patcher from './patcher';
import { WebpackModules, Filters } from './webpackmodules';
import DiscordApi from './discordapi';
import { EmoteModule } from 'builtin';
import { Reflection } from 'ui';
import { ClientLogger as Logger } from 'common';

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
        for (let { } of this.recursiveArray(parent, key))
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

    static get ReactDOM() {
        return WebpackModules.getModuleByName('ReactDOM');
    }
}

class ReactComponent {
    constructor(id, component, retVal) {
        this._id = id;
        this._component = component;
        this._retVal = retVal;
        const self = this;
        Patcher.slavepatch(this.component.prototype, 'componentWillMount', function(args, parv) {
            self.eventCallback('componentWillMount', {
                component: this,
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'render', function (args, parv) {
            self.eventCallback('render', {
                component: this,
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'componentDidMount', function (args, parv) {
            self.eventCallback('componentDidMount', {
                component: this,
                props: this.props,
                state: this.state,
                element: Helpers.ReactDOM.findDOMNode(this),
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'componentWillReceiveProps', function (args, parv) {
            const [nextProps] = args;
            self.eventCallback('componentWillReceiveProps', {
                component: this,
                nextProps,
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'shouldComponentUpdate', function (args, parv) {
            const [nextProps, nextState] = args;
            self.eventCallback('shouldComponentUpdate', {
                component: this,
                nextProps,
                nextState,
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'componentWillUpdate', function (args, parv) {
            const [nextProps, nextState] = args;
            self.eventCallback('componentWillUpdate', {
                component: this,
                nextProps,
                nextState,
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'componentDidUpdate', function(args, parv) {
            const [prevProps, prevState] = args;
            self.eventCallback('componentDidUpdate', {
                component: this,
                prevProps,
                prevState,
                props: this.props,
                state: this.state,
                element: Helpers.ReactDOM.findDOMNode(this),
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'componentWillUnmount', function (args, parv) {
            self.eventCallback('componentWillUnmount', {
                component: this,
                retVal: parv.retVal
            });
        });
        Patcher.slavepatch(this.component.prototype, 'componentDidCatch', function (args, parv) {
            const [error, info] = args;
            self.eventCallback('componentDidCatch', {
                component: this,
                error,
                info,
                retVal: parv.retVal
            });
        });
    }

    eventCallback(event, eventData) {
        for (const listener of this.events.find(e => e.id === event).listeners) {
            listener(eventData);
        }
    }

    get events() {
        return this._events || (this._events = [
            { id: 'componentWillMount', listeners: [] },
            { id: 'render', listeners: [] },
            { id: 'componentDidMount', listeners: [] },
            { id: 'componentWillReceiveProps', listeners: [] },
            { id: 'shouldComponentUpdate', listeners: [] },
            { id: 'componentWillUpdate', listeners: [] },
            { id: 'componentDidUpdate', listeners: [] },
            { id: 'componentWillUnmount', listeners: [] },
            { id: 'componentDidCatch', listeners: [] }
        ]);
    }

    on(event, callback) {
        const have = this.events.find(e => e.id === event);
        if (!have) return;
        have.listeners.push(callback);
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

export class ReactAutoPatcher {
    static async autoPatch() {
        await this.ensureReact();
        Patcher.superpatch('React', 'createElement', (component, retVal) => ReactComponents.push(component, retVal));
        this.patchem();
    }

    static async ensureReact() {
        while (!window.webpackJsonp || !WebpackModules.getModuleByName('React'))
            await new Promise(resolve => setTimeout(resolve, 10));
    }

    static patchem() {
        this.patchMessage();
        this.patchMessageGroup();
        this.patchChannelMember();
    }

    static async patchMessage() {
        this.Message.component = await ReactComponents.getComponent('Message', true, { selector: '.message' });
        this.Message.component.on('render', ({ component, retVal, p }) => {
            const { message } = component.props;
            const { id, colorString, bot, author, attachments, embeds } = message;
            retVal.props['data-message-id'] = id;
            retVal.props['data-colourstring'] = colorString;
            if (author && author.id) retVal.props['data-user-id'] = author.id;
            if (bot || (author && author.bot)) retVal.props.className += ' bd-isBot';
            if (attachments && attachments.length) retVal.props.className += ' bd-hasAttachments';
            if (embeds && embeds.length) retVal.props.className += ' bd-hasEmbeds';
            if (author && author.id === DiscordApi.currentUser.id) retVal.props.className += ' bd-isCurrentUser';
            try {
                // First child has all the actual text content, second is the edited timestamp
                const markup = Helpers.findByProp(retVal, 'className', 'markup').children;
                markup[0] = EmoteModule.processMarkup(markup[0]);
            } catch (err) {
                Logger.err('ReactAutoPatcher', ['MARKUP PARSER ERROR', err]);
            }
        });
    }

    static async patchMessageGroup() {
        ReactComponents.setName('MessageGroup', this.MessageGroup.filter);
        this.MessageGroup.component = await ReactComponents.getComponent('MessageGroup', true, { selector: '.message-group' });
        this.MessageGroup.component.on('render', ({ component, retVal, p }) => {
            const authorid = component.props.messages[0].author.id;
            retVal.props['data-author-id'] = authorid;
            if (authorid === DiscordApi.currentUser.id) retVal.props.className += ' bd-isCurrentUser';
        });
    }

    static async patchChannelMember() {
        this.ChannelMember.component = await ReactComponents.getComponent('ChannelMember');
        this.ChannelMember.component.on('render', ({ component, retVal, p }) => {
            const { user, isOwner } = component.props;
            retVal.props.children.props['data-member-id'] = user.id;
            if (user.id === DiscordApi.currentUser.id) retVal.props.children.props.className += ' bd-isCurrentUser';
            if (isOwner) retVal.props.children.props.className += ' bd-isOwner';
        });
    }

    static get MessageGroup() {
        return this._messageGroup || (
            this._messageGroup = {
                filter: Filters.byCode(/"message-group"[\s\S]*"has-divider"[\s\S]*"hide-overflow"[\s\S]*"is-local-bot-message"/, c => c.prototype && c.prototype.render)
            });
    }

    static get Message() {
        return this._message || (this._message = {});
    }

    static get ChannelMember() {
        return this._channelMember || (
            this._channelMember = {});
    }
}

export class ReactComponents {
    static get components() { return this._components || (this._components = []) }
    static get unknownComponents() { return this._unknownComponents || (this._unknownComponents = [])}
    static get listeners() { return this._listeners || (this._listeners = []) }
    static get nameSetters() { return this._nameSetters || (this._nameSetters =[])}

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

    static async getComponent(name, important, importantArgs) {
        const have = this.components.find(c => c.id === name);
        if (have) return have;
        if (important) {
            const importantInterval = setInterval(() => {
                if (this.components.find(c => c.id === name)) {
                    Logger.info('ReactComponents', `Important component ${name} already found`);
                    clearInterval(importantInterval);
                    return;
                }
                const select = document.querySelector(importantArgs.selector);
                if (!select) return;
                const reflect = Reflection(select);
                if (!reflect.component) {
                    clearInterval(important);
                    Logger.err('ReactComponents', [`FAILED TO GET IMPORTANT COMPONENT ${name} WITH REFLECTION FROM`, select]);
                    return;
                }
                if (!reflect.component.displayName) reflect.component.displayName = name;
                Logger.info('ReactComponents', `Found important component ${name} with reflection`);
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
            this.listeners.find(l => l.id === name).listeners.push(c => resolve(c));
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
            if (filter.filter(component)) {
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
