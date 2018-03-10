/**
 * BetterDiscord Emote Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { FileUtils } from 'common';
import { Events, Globals } from 'modules';
import { DOM, VueInjector } from 'ui';
import EmoteComponent from './EmoteComponent.vue';
let emotes = null;

export default class {

    static async observe() {
        const dataPath = Globals.getObject('paths').find(path => path.id === 'data').path;
        try {
            emotes = await FileUtils.readJsonFromFile(dataPath + '/emotes.json');
            Events.on('ui:mutable:.markup',
                markup => {
                    if (!emotes) return;
                    this.injectEmotes(markup);
                });
        } catch (err) {
            console.log(err);
        }
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
                        DOM.createElement('span'),
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
        if (!emotes) return null;
        const name = word.replace(/:/g, '');
        const emote = emotes.find(emote => emote.id === name);
        if (!emote) return null;
        let { id, value } = emote;
        if (value.id) value = value.id;
        const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
        return { name, src: uri.replace(':id', value) };
    }

    static filterTest() {
        const re = new RegExp('Kappa', 'i');
        const filtered = emotes.filter(emote => re.test(emote.id));
        return filtered.slice(0, 10);
    }

    static filter(regex, limit) {
        let index = 0;
        return emotes.filter(emote => {
            if (index >= limit) return false;
            if (regex.test(emote.id)) {
                index++;
                return true;
            }
        });
    }
}
