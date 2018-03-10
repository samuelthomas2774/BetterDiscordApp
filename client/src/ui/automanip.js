/**
 * BetterDiscord Automated DOM Manipulations
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events, WebpackModules, EventListener } from 'modules';
import Reflection from './reflection';
import DOM from './dom';
import VueInjector from './vueinjector';
import EditedTimeStamp from './components/common/EditedTimestamp.vue';
import Autocomplete from './components/common/Autocomplete.vue';

class TempApi {
    static get currentGuildId() {
        try {
            return WebpackModules.getModuleByName('SelectedGuildStore').getGuildId();
        } catch (err) {
            return 0;
        }
    }
    static get currentChannelId() {
        try {
            return WebpackModules.getModuleByName('SelectedChannelStore').getChannelId();
        } catch (err) {
            return 0;
        }
    }
    static get currentUserId() {
        try {
            return WebpackModules.getModuleByName('UserStore').getCurrentUser().id;
        } catch (err) {
            return 0;
        }
    }
}

export default class extends EventListener {

    constructor() {
        super();
        window.injectAc = this.injectAutocomplete;
        const messageFilter = function (m) {
            return m.addedNodes && m.addedNodes.length && m.addedNodes[0].classList && m.addedNodes[0].classList.contains('message-group');
        }

        DOM.observer.subscribe('loading-more-manip', messageFilter, mutations => {
            this.setIds();
            this.makeMutable();
            Events.emit('ui:laodedmore', mutations.map(m => m.addedNodes[0]));
        }, 'filter');

        const userFilter = function (m) {
            return m.addedNodes && m.addedNodes.length && m.addedNodes[0].classList && m.addedNodes[0].classList.contains('member');
        }

        DOM.observer.subscribe('loading-more-users-manip', userFilter, mutations => {
            this.setUserIds();
            Events.emit('ui:loadedmoreusers', mutations.map(m => m.addedNodes[0]));
        }, 'filter');
    }

    bindings() {
        this.manipAll = this.manipAll.bind(this);
        this.markupInjector = this.markupInjector.bind(this);
        this.setIds = this.setIds.bind(this);
        this.setMessageIds = this.setMessageIds.bind(this);
        this.setUserIds = this.setUserIds.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'server-switch', callback: this.manipAll },
            { id: 'channel-switch', callback: this.manipAll },
            { id: 'discord:MESSAGE_CREATE', callback: this.markupInjector },
            { id: 'discord:MESSAGE_UPDATE', callback: this.markupInjector },
            { id: 'gkh:keyup', callback: this.injectAutocomplete }
        ];
    }

    manipAll() {
        try {
            this.appMount.setAttribute('guild-id', TempApi.currentGuildId);
            this.appMount.setAttribute('channel-id', TempApi.currentChannelId);
            this.setIds();
            this.makeMutable();
        } catch (err) {
            console.log(err);
        }
    }

    markupInjector(e) {
        if (!e.element) return;
        this.setId(e.element);
        const markup = e.element.querySelector('.markup:not(.mutable)');
        if (markup) this.injectMarkup(markup, this.cloneMarkup(markup), false);
    }

    getEts(node) {
        try {
            const reh = Object.keys(node).find(k => k.startsWith('__reactInternalInstance'));
            return node[reh].memoizedProps.children[node[reh].memoizedProps.children.length - 1].props.text;
        } catch (err) {
            return null;
        }
    }

    makeMutable() {
        for (const el of document.querySelectorAll('.markup:not(.mutable)')) {
            this.injectMarkup(el, this.cloneMarkup(el), false);
        }
    }

    cloneMarkup(node) {
        const childNodes = [...node.childNodes];
        const clone = document.createElement('div');
        clone.className = 'markup mutable';
        const ets = this.getEts(node);
        for (const [cni, cn] of childNodes.entries()) {
            if (cn.nodeType !== Node.TEXT_NODE) {
                if (cn.className.includes('edited')) continue;
            }
            clone.appendChild(cn.cloneNode(true));
        }
        return { clone, ets }
    }

    injectMarkup(sibling, markup, reinject) {
        if (sibling.className && sibling.className.includes('mutable')) return; // Ignore trying to make mutable again
        let cc = null;
        for (const cn of sibling.parentElement.childNodes) {
            if (cn.className && cn.className.includes('mutable')) cc = cn;
        }
        if (cc) sibling.parentElement.removeChild(cc);
        if (markup === true) markup = this.cloneMarkup(sibling);

        sibling.parentElement.insertBefore(markup.clone, sibling);
        sibling.classList.add('shadow');
        sibling.style.display = 'none';
        if (markup.ets) {
            const etsRoot = document.createElement('span');
            markup.clone.appendChild(etsRoot);
            VueInjector.inject(
                etsRoot,
                DOM.createElement('span', null, 'test'),
                { EditedTimeStamp },
                `<EditedTimeStamp ets="${markup.ets}"/>`,
                true
            );
        }

        Events.emit('ui:mutable:.markup', markup.clone);
    }

    setIds() {
        this.setMessageIds();
        this.setUserIds();
    }

    setMessageIds() {
        for (let msg of document.querySelectorAll('.message')) {
            this.setId(msg);
        }
    }

    setUserIds() {
        for (let user of document.querySelectorAll('.channel-members-wrap .member')) {
            this.setUserId(user);
        }
    }

    setId(msg) {
        if (msg.hasAttribute('message-id')) return;
        const messageid = Reflection(msg).prop('message.id');
        const authorid = Reflection(msg).prop('message.author.id');
        if (!messageid || !authorid) return;
        msg.setAttribute('data-message-id', messageid);
        const msgGroup = msg.closest('.message-group');
        if (!msgGroup) return;
        msgGroup.setAttribute('data-author-id', authorid);
        if (authorid === TempApi.currentUserId) msgGroup.setAttribute('data-currentuser', true);
    }

    setUserId(user) {
        if (user.hasAttribute('data-user-id')) return;
        const userid = Reflection(user).prop('user.id');
        if (!userid) return;
        user.setAttribute('data-user-id', userid);
        const currentUser = userid === TempApi.currentUserId;
        if (currentUser) user.setAttribute('data-currentuser', true);
        Events.emit('ui:useridset', user);
    }

    get appMount() {
        return document.getElementById('app-mount');
    }

    injectAutocomplete(e) {
        if (document.querySelector('.bd-autocomplete')) return;
        if (!e.target.closest('[class*=channelTextArea]')) return;
        const root = document.createElement('span');
        const parent = document.querySelector('[class*="channelTextArea"] > [class*="inner"]');
        if (!parent) return;
        parent.append(root);
        VueInjector.inject(
            root,
            DOM.createElement('span'),
            { Autocomplete },
           `<Autocomplete initial="${e.target.value}"/>`,
            true
        );
    }
}
