/**
 * BetterDiscord Emote Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events } from 'modules';
import { DOM, VueInjector } from 'ui';
import EditedTimeStamp from './EditedTimeStamp.vue';
import EmoteComponent from './EmoteComponent.vue';

import TwitchEmotes from '../data/twitch_emotes.json';


export default class {

    static observe() {
        Events.on('server-switch', this.injectAll.bind(this));
        Events.on('channel-switch', this.injectAll.bind(this));
        Events.on('new-message', e => console.log(e)); // TODO
    }

    static injectAll() {
        for (const el of document.querySelectorAll('.markup:not(.mutable)')) {
            this.injectMarkup(el, this.cloneMarkup(el), false);
        }
    }

    static cloneMarkup(node) {
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

    static getEts(node) {
        try {
            const reh = Object.keys(node).find(k => k.startsWith('__reactInternalInstance'));
            return node[reh].memoizedProps.children[node[reh].memoizedProps.children.length - 1].props.text;
        } catch (err) {
            return null;
        }
    }

    static injectMarkup(sibling, markup, reinject) {
        if (sibling.className && sibling.className.includes('mutable')) return; // Ignore trying to make mutable mutable again
        let cc = null;
        for (const cn of sibling.parentElement.childNodes) {
             if (cn.className && cn.className.includes('mutable')) cc = cn;
        }
        if (cc) sibling.parentElement.removeChild(cc);
        markup.clone = this.injectEmotes(markup.clone);
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

        if (reinject) return;
        new MutationObserver(() => {
            this.injectMarkup(sibling, this.cloneMarkup(sibling), true);
        }).observe(sibling, { characterData: false, attributes: false, childList: true, subtree: false });

        new MutationObserver(() => {
            this.injectMarkup(sibling, this.cloneMarkup(sibling), true);
        }).observe(sibling, { characterData: true, attributes: false, childList: false, subtree: true });
    }

    static makeMutable(node) {
        if (node.classList && node.classList.contains('shadow')) return;
        this.injectMarkup(node, this.cloneMarkup(node));
    }

    static injectEmotes(node) {
        if (!/:[\w]+:/gmi.test(node.textContent)) return node;
        const childNodes = [...node.childNodes];
        const newNode = document.createElement('div');
        newNode.className = 'markup mutable hasEmotes';

        for (const [cni, cn] of childNodes.entries()) {
            if (cn.nodeType !== Node.TEXT_NODE) {
                newNode.appendChild(cn);
                continue;
            }

            const { nodeValue } = cn;
            const words = nodeValue.split(/([^\s]+)([\s]|$)/g);

            if (!words.some(word => word.startsWith(':') && word.endsWith(':'))) {
                newNode.appendChild(cn);
                continue;
            }
            let text = null;
            for (const [wi, word] of words.entries()) {
                let isEmote = null;
                if (word.startsWith(':') && word.endsWith(':')) {
                    isEmote = this.isEmote(word);
                }

                if (isEmote) {
                    if (text !== null) {
                        newNode.appendChild(document.createTextNode(text));
                        text = null;
                    }
                    
                    const emoteRoot = document.createElement('span');
                    newNode.appendChild(emoteRoot);
                    VueInjector.inject(
                        emoteRoot,
                        DOM.createElement('span', null, 'emotetest'),
                        { EmoteComponent },
                        `<EmoteComponent src="${isEmote.src}" name="${isEmote.name}"/>`,
                        true
                    );
                    continue;
                }

                if (text === null) {
                    text = word;
                } else {
                    text += word;
                }

                if (wi === words.length - 1) {
                    newNode.appendChild(document.createTextNode(text));
                }
            }
        }
        return newNode;
    }

    static isEmote(word) {
        const name = word.replace(/:/g, '');
        if (TwitchEmotes.hasOwnProperty(name)) {
            const src = `https://static-cdn.jtvnw.net/emoticons/v1/${TwitchEmotes[name]}/1.0`;
            return { name, src };
        }
        return null;
    }
}
