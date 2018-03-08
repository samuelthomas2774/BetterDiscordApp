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
        Events.on('ui:mutable:.markup', markup => {
            this.injectEmotes(markup);
        });
    }

    static injectEmotes(node) {
        if (!/:[\w]+:/gmi.test(node.textContent)) return node;
        const childNodes = [...node.childNodes];
        const newNode = document.createElement('div');
        newNode.className = node.className;
        newNode.classList.add('hasEmotes');

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
        node.replaceWith(newNode);
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
