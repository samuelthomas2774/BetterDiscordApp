/**
 * BetterDiscord Automated DOM Manipulations
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events, WebpackModules } from 'modules';
import Reflection from './reflection';
import DOM from './dom';
import VueInjector from './vueinjector';
import EditedTimeStamp from './components/common/EditedTimeStamp.vue';

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

export default class {

    constructor() {
        window.Reflection = Reflection;
        Events.on('server-switch', e => {
            try {
                this.appMount.setAttribute('guild-id', TempApi.currentGuildId);
                this.appMount.setAttribute('channel-id', TempApi.currentChannelId);
                this.setIds();
                this.makeMutable();
            } catch (err) {
                console.log(err);
            }
        });
        Events.on('channel-switch', e => {
            try {
                this.appMount.setAttribute('guild-id', TempApi.currentGuildId);
                this.appMount.setAttribute('channel-id', TempApi.currentChannelId);
                this.setIds();
                this.makeMutable();
            } catch (err) {
                console.log(err);
            }
        });
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

        Events.emit('mutable:.markup', markup.clone);

        if (reinject) return;
        new MutationObserver(() => {
            this.injectMarkup(sibling, this.cloneMarkup(sibling), true);
        }).observe(sibling, { characterData: false, attributes: false, childList: true, subtree: false });

        new MutationObserver(() => {
            this.injectMarkup(sibling, this.cloneMarkup(sibling), true);
        }).observe(sibling, { characterData: true, attributes: false, childList: false, subtree: true });
    }

    setIds() {
        for (let msg of document.querySelectorAll('.message')) {
            if (msg.hasAttribute('message-id')) continue;
            const r = Reflection(msg);
            const message = r.prop('message');
            if (!message) continue;
            const { id, author } = message;
            if (!id || !author) continue;
            const currentUser = author.id === TempApi.currentUserId;
            DOM.setAttributes(msg, [{ name: 'message-id', value: message.id }]);
            const msgGroup = msg.closest('.message-group');
            if (!msgGroup) continue;
            DOM.setAttributes(msgGroup, [{ name: 'author-id', value: author.id }, { name: 'author-is-currentuser', value: currentUser }]);
        }
    }

    get appMount() {
        return document.getElementById('app-mount');
    }
}
