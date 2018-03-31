/**
 * BetterDiscord Emote Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events, Settings, Globals, WebpackModules, ReactComponents, MonkeyPatch } from 'modules';
import { DOM, VueInjector, Reflection } from 'ui';
import { Utils, FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';
import EmoteComponent from './EmoteComponent.vue';

let emotes = null;
const emotesEnabled = true;
const enforceWrapperFrom = (new Date('2018-05-01')).valueOf();

export default new class EmoteModule {

    constructor() {
        this.favourite_emotes = [];
    }

    init() {
        this.enabledSetting = Settings.getSetting('emotes', 'default', 'enable');
        this.enabledSetting.on('setting-updated', event => {
            // Rerender all messages (or if we're disabling emotes, those that have emotes)
            for (const message of document.querySelectorAll(event.value ? '.message' : '.bd-emote-outer')) {
                Reflection(event.value ? message : message.closest('.message')).forceUpdate();
            }
        });

        return this.observe();
    }

    /**
     * Sets an emote as favourite.
     * @param {String} emote The name of the emote
     * @param {Boolean} favourite The new favourite state
     * @param {Boolean} save Whether to save settings
     * @return {Promise}
     */
    setFavourite(emote, favourite, save = true) {
        if (favourite && !this.favourite_emotes.includes(emote)) this.favourite_emotes.push(emote);
        if (!favourite) Utils.removeFromArray(this.favourite_emotes, emote);
        if (save) return Settings.saveSettings();
    }

    addFavourite(emote, save = true) {
        return this.setFavourite(emote, true, save);
    }

    removeFavourite(emote, save = true) {
        return this.setFavourite(emote, false, save);
    }

    isFavourite(emote) {
        return this.favourite_emotes.includes(emote);
    }

    get searchCache() {
        return this._searchCache || (this._searchCache = {});
    }

    get emoteDb() {
        return emotes;
    }

    get React() {
        return WebpackModules.getModuleByName('React');
    }

    get ReactDOM() {
        return WebpackModules.getModuleByName('ReactDOM');
    }

    processMarkup(markup, timestamp) {
        if (!this.enabledSetting.value) return markup;

        timestamp = timestamp.valueOf();
        const allowNoWrapper = timestamp < enforceWrapperFrom;

        const newMarkup = [];
        for (const child of markup) {
            if (typeof child !== 'string') {
                newMarkup.push(child);
                continue;
            }
            if (!this.testWord(child) && !allowNoWrapper) {
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
                    newMarkup.push(this.React.createElement('span', {
                        className: 'bd-emote-outer',
                        'data-bdemote-name': isEmote.name,
                        'data-bdemote-src': isEmote.src,
                        'data-has-wrapper': /;[\w]+;/gmi.test(word)
                    }));
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

    testWord(word) {
        return !/;[\w]+;/gmi.test(word);
    }

    injectAll() {
        if (!emotesEnabled) return;
        const all = document.getElementsByClassName('bd-emote-outer');
        for (const ec of all) {
            if (ec.children.length) continue;
            this.injectEmote(ec);
        }
    }

    findByProp(obj, what, value) {
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

    async observe() {
        const dataPath = Globals.getPath('data');
        try {
            emotes = await FileUtils.readJsonFromFile(path.join(dataPath, 'emotes.json'));
        } catch (err) {
            Logger.err('EmoteModule', [`Failed to load emote data. Make sure you've downloaded the emote data and placed it in ${dataPath}:`, err]);
            return;
        }

        try {
            const Message = await ReactComponents.getComponent('Message');
            this.unpatchRender = MonkeyPatch('BD:EmoteModule', Message.component.prototype).after('render', (component, args, retVal) => {
                try {
                    // First child has all the actual text content, second is the edited timestamp
                    const markup = this.findByProp(retVal, 'className', 'markup');
                    if (!markup) return;
                    Logger.log('EmoteModule', ['Message :', retVal, component]);
                    markup.children[0] = this.processMarkup(markup.children[0], component.props.message.editedTimestamp || component.props.message.timestamp);
                } catch (err) {
                    Logger.err('EmoteModule', err);
                }
            });
            for (const message of document.querySelectorAll('.message')) {
                Reflection(message).forceUpdate();
            }
            this.injectAll();
            this.unpatchMount = MonkeyPatch('BD:EmoteModule', Message.component.prototype).after('componentDidMount', component => {
                const element = this.ReactDOM.findDOMNode(component);
                if (!element) return;
                this.injectEmotes(element);
            });
            this.unpatchUpdate = MonkeyPatch('BD:EmoteModule', Message.component.prototype).after('componentDidUpdate', component => {
                const element = this.ReactDOM.findDOMNode(component);
                if (!element) return;
                this.injectEmotes(element);
            });
        } catch (err) {
            Logger.err('EmoteModule', err);
        }
    }

    injectEmote(root) {
        if (!emotesEnabled) return;
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }
        const { bdemoteName, bdemoteSrc, hasWrapper } = root.dataset;
        if (!bdemoteName || !bdemoteSrc) return;
        VueInjector.inject(root, {
            components: { EmoteComponent },
            data: { src: bdemoteSrc, name: bdemoteName, hasWrapper },
            template: '<EmoteComponent :src="src" :name="name" :hasWrapper="hasWrapper" />'
        }, DOM.createElement('span'));
        root.classList.add('bd-is-emote');
    }

    injectEmotes(element) {
        if (!emotesEnabled || !element) return;
        for (const beo of element.getElementsByClassName('bd-emote-outer')) this.injectEmote(beo);
    }

    isEmote(word) {
        if (!emotes) return null;
        const name = word.replace(/;/g, '');
        const emote = emotes.find(emote => emote.id === name);
        if (!emote) return null;
        let { id, value } = emote;
        if (value.id) value = value.id;
        const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
        return { name, src: uri.replace(':id', value) };
    }

    filterTest() {
        const re = new RegExp('Kappa', 'i');
        const filtered = emotes.filter(emote => re.test(emote.id));
        return filtered.slice(0, 10);
    }

    filter(regex, limit, start = 0) {
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
