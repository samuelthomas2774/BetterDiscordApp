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
    static get React() {
        return WebpackModules.getModuleByName('React');
    }

    static processMarkup(markup) {
        if (!emotesEnabled) return markup; // TODO Get it from setttings
        const newMarkup = [];
        for (const [ti, t] of markup.entries()) {
            if ('string' !== typeof t) {
                newMarkup.push(t);
                continue;
            }

            const words = t.split(/([^\s]+)([\s]|$)/g);
            if (!words) continue;
            let text = null;
            for (const [wi, word] of words.entries()) {
                let isEmote = false;
                if (this.testWord(word)) {
                    isEmote = true;
                }
                if (isEmote) {
                    if (text !== null) {
                        newMarkup.push(text);
                        text = null;
                    }
                    newMarkup.push(this.React.createElement('span', { className: 'bd-emote-outer' }, word));
                    continue;
                }
                if (text === null) {
                    text = `${word}`;
                } else {
                    text += `${word}`;
                }
                if (wi === words.length - 1) {
                    newMarkup.push(text);
                }
            }
        }
        return newMarkup;
    }

    static testWord(word) {
        if (!/:[\w]+:/gmi.test(word)) return false;
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

    static injectEmote(e) {
        if (!emotesEnabled) return;
        const isEmote = this.isEmote(e.textContent);
        if (!isEmote) return;
        VueInjector.inject(e, {
            template: `<EmoteComponent :src="isEmote.src" :name="isEmote.name" />`,
            components: { EmoteComponent },
            data: { isEmote }
        }, DOM.createElement('span'));
        e.classList.add('bd-is-emote');
    }

    static injectEmotes(element) {
        if (!emotesEnabled || !element) return;
        for (const beo of element.getElementsByClassName('bd-emote-outer')) this.injectEmote(beo);
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
