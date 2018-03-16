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
import { Events, Globals, WebpackModules, ReactComponents } from 'modules';
import { DOM, VueInjector } from 'ui';
import EmoteComponent from './EmoteComponent.vue';

let emotes = null;
const emotesEnabled = true;

export default class {
    static get searchCache() {
        return this._searchCache || (this._searchCache = {});
    }
    static get emoteDb() {
        return emotes;
    }
    static get React() {
        return WebpackModules.getModuleByName('React');
    }

    static processMarkup(markup) {
        if (!emotesEnabled) return markup; // TODO Get it from setttings
        const newMarkup = [];
        for (const child of markup) {
            if ('string' !== typeof child) {
                newMarkup.push(child);
                continue;
            }
            if (!this.testWord(child)) {
                newMarkup.push(child);
                continue;
            }
            const words = child.split(/([^\s]+)([\s]|$)/g);
            if (!words) continue;
            let text = null;
            for (const [wordIndex, word] of words.entries()) {
                const isEmote = this.isEmote(word);
                if (isEmote) {
                    if (text !== null) {
                        newMarkup.push(text);
                        text = null;
                    }
                    newMarkup.push(this.React.createElement('span', { className: 'bd-emote-outer', 'data-bdemote-name': isEmote.name, 'data-bdemote-src': isEmote.src }));
                    continue;
                }
                if (text === null) {
                    text = word;
                } else {
                    text += word;
                }
                if (wordIndex === words.length - 1) {
                    newMarkup.push(text);
                }
            }
        }
        return newMarkup;
    }

    static testWord(word) {
        if (!/;[\w]+;/gmi.test(word)) return false;
        return true;
    }

    static injectAll() {
        if (!emotesEnabled) return;
        const all = document.getElementsByClassName('bd-emote-outer');
        for (const ec of all) {
            if (ec.children.length) continue;
            this.injectEmote(ec);
        }
    }

    static async observe() {
        const dataPath = Globals.getObject('paths').find(path => path.id === 'data').path;
        try {
            emotes = await FileUtils.readJsonFromFile(dataPath + '/emotes.json');
            const Message = await ReactComponents.getComponent('Message');
            Message.on('componentDidMount', ({ element }) => this.injectEmotes(element));
            Message.on('componentDidUpdate', ({ state, element }) => {
                if (!state.isEditing) this.injectEmotes(element);
            });
        } catch (err) {
            emotes = [];
            console.log(err);
        }
    }

    static injectEmote(root) {
        if (!emotesEnabled) return;
        const emote = root.dataset;
        if (!emote) return;
        VueInjector.inject(e, {
            template: `<EmoteComponent :src="emote.src" :name="emote.name" />`,
            components: { EmoteComponent },
            data: { emote }
        }, DOM.createElement('span'));
        root.classList.add('bd-is-emote');
    }

    static injectEmotes(element) {
        if (!emotesEnabled || !element) return;
        for (const beo of element.getElementsByClassName('bd-emote-outer')) this.injectEmote(beo);
    }

    static isEmote(word) {
        if (!emotes) return null;
        const name = word.replace(/;/g, '');
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

    static filter(regex, limit, start = 0) {
        const key = `${regex}:${limit}:${start}`;
        if (this.searchCache.hasOwnProperty(key)) return this.searchCache[key];
        let index = 0;
        let startIndex = 0;
        return this.searchCache[key] = emotes.filter(emote => {
            if (index >= limit) return false;
            if (regex.test(emote.id)) {
                if (startIndex < start) {
                    startIndex++;
                    return false;
                }
                index++;
                return true;
            }
        });
    }

}
