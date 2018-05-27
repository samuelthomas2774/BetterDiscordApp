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

const enforceWrapperFrom = (new Date('2018-05-01')).valueOf();

export default new class EmoteModule {

    constructor() {
        this.emotes = new Map();
        this.favourite_emotes = [];
    }

    async init() {
        this.enabledSetting = Settings.getSetting('emotes', 'default', 'enable');
        this.enabledSetting.on('setting-updated', event => {
            // Rerender all messages (or if we're disabling emotes, those that have emotes)
            for (const message of document.querySelectorAll(event.value ? '.message' : '.bd-emote-outer')) {
                Reflection(event.value ? message : message.closest('.message')).forceUpdate();
            }
        });

        const dataPath = Globals.getPath('data');
        try {
            await this.load(path.join(dataPath, 'emotes.json'));
        } catch (err) {
            Logger.err('EmoteModule', [`Failed to load emote data. Make sure you've downloaded the emote data and placed it in ${dataPath}:`, err]);
            return;
        }

        try {
            await this.observe();
        } catch (err) {
            Logger.err('EmoteModule', ['Error patching Message', err]);
        }
    }

    async load(dataPath) {
        const emotes = await FileUtils.readJsonFromFile(dataPath);
        for (let [index, emote] of emotes.entries()) {
            // Pause every 10000 emotes so the window doesn't freeze
            if ((index % 10000) === 0)
                await Utils.wait();

            const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
            emote.name = emote.id;
            emote.src = uri.replace(':id', emote.value.id || emote.value);
            this.emotes.set(emote.id, emote);
        }
    }

    /**
     * Sets an emote as favourite.
     * @param {String} emote The name of the emote
     * @param {Boolean} favourite The new favourite state
     * @param {Boolean} save Whether to save settings
     * @return {Promise}
     */
    setFavourite(emote, favourite, save = true) {
        emote = emote.id || emote;
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
        emote = emote.id || emote;
        return this.favourite_emotes.includes(emote);
    }

    get searchCache() {
        return this._searchCache || (this._searchCache = {});
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
                const emote = this.getEmote(word);
                if (emote) {
                    if (text !== null) {
                        newMarkup.push(text);
                        text = null;
                    }
                    newMarkup.push(this.React.createElement('span', {
                        className: 'bd-emote-outer',
                        'data-bdemote-name': emote.name,
                        'data-bdemote-src': emote.src,
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
        if (!this.enabledSetting.value) return;

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
        const Message = await ReactComponents.getComponent('Message');
        this.unpatchRender = MonkeyPatch('BD:EmoteModule', Message.component.prototype).after('render', (component, args, retVal) => {
            try {
                // First child has all the actual text content, second is the edited timestamp
                const markup = this.findByProp(retVal, 'className', 'markup');
                if (!markup) return;
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
    }

    injectEmote(root) {
        if (!this.enabledSetting.value) return;

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
        if (!this.enabledSetting.value || !element) return;

        for (const beo of element.getElementsByClassName('bd-emote-outer')) this.injectEmote(beo);
    }

    getEmote(word) {
        const name = word.replace(/;/g, '');
        return this.emotes.get(name);
    }

    filter(regex, limit, start = 0) {
        const key = `${regex}:${limit}:${start}`;
        if (this.searchCache.hasOwnProperty(key)) return this.searchCache[key];
        let index = 0;
        let startIndex = 0;

        const matching = this.searchCache[key] = [];
        for (let emote of this.emotes.values()) {
            if (index >= limit) break;
            if (regex.test(emote.id)) {
                if (startIndex < start) {
                    startIndex++;
                    continue;
                }
                index++;
                matching.push(emote);
            }
        }

        return matching;
    }

}
