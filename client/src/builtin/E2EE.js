/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings, Cache } from 'modules';
import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher, DiscordApi, Security } from 'modules';
import { VueInjector, Reflection } from 'ui';
import { ClientLogger as Logger } from 'common';
import { request } from 'vendor';
import { Utils } from 'common';
import E2EEComponent from './E2EEComponent.vue';
import E2EEMessageButton from './E2EEMessageButton.vue';
import aes256 from 'aes256';
import crypto from 'node-crypto';

let seed = crypto.randomBytes(64).toString('hex');

export default new class E2EE extends BuiltinModule {

    constructor() {
        super();
        this.master = this.encrypt(seed, 'temporarymasterkey');
        this.encryptNewMessages = true;
    }

    setMaster(key) {
        seed = crypto.randomBytes(64).toString('hex');
        const newMaster = this.encrypt(seed, key);
        // TODO re-encrypt everything with new master
        return (this.master = newMaster);
    }

    get settingPath() {
        return ['security', 'default', 'e2ee'];
    }

    get database() {
        return Settings.getSetting('security', 'e2eedb', 'e2ekvps').value;
    }

    encrypt(key, content, prefix = '') {
        if (!content) {
            // Get key for current channel and encrypt
            const haveKey = this.getKey(DiscordApi.currentChannel.id);
            if (!haveKey) return 'nokey';
            return this.encrypt(this.decrypt(this.decrypt(seed, this.master), haveKey), key);
        }
        return prefix + aes256.encrypt(key, content);
    }

    decrypt(key, content, prefix = '') {
        return aes256.decrypt(key, content.replace(prefix, ''));
    }

    async createHmac(data) {
        const haveKey = this.getKey(DiscordApi.currentChannel.id);
        if (!haveKey) return null;
        return Security.createHmac(haveKey, data);
    }

    getKey(channelId) {
        const haveKey = this.database.find(kvp => kvp.value.key === channelId);
        if (!haveKey) return null;
        return haveKey.value.value;
    }

    async enabled(e) {
        this.patchMessageContent();
        const selector = '.' + WebpackModules.getClassName('channelTextArea', 'emojiButton');
        const cta = await ReactComponents.getComponent('ChannelTextArea', { selector });
        this.patchChannelTextArea(cta);
        this.patchChannelTextAreaSubmit(cta);
        cta.forceUpdateAll();
    }

    async patchMessageContent() {
        const selector = '.' + WebpackModules.getClassName('container', 'containerCozy', 'containerCompact', 'edited');
        const MessageContent = await ReactComponents.getComponent('MessageContent', { selector });
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).before('render', this.beforeRenderMessageContent.bind(this));
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).after('render', this.renderMessageContent.bind(this));
        const ImageWrapper = await ReactComponents.getComponent('ImageWrapper', { selector: '.' + WebpackModules.getClassName('imageWrapper') });
        MonkeyPatch('BD:E2EE', ImageWrapper.component.prototype).before('render', this.beforeRenderImageWrapper.bind(this));
    }

    beforeRenderMessageContent(component, args, retVal) {
        const key = this.getKey(DiscordApi.currentChannel.id);
        if (!key) return; // We don't have a key for this channel

        const Message = WebpackModules.getModuleByPrototypes(['isMentioned']);
        const MessageParser = WebpackModules.getModuleByName('MessageParser');
        const currentChannel = DiscordApi.currentChannel.discordObject;

        if (!component.props || !component.props.message) return;
        const { content } = component.props.message;
        if (typeof content !== 'string') return; // Ignore any non string content
        if (!content.startsWith('$:')) return; // Not an encrypted string
        let decrypt;
        try {
            decrypt = this.decrypt(this.decrypt(this.decrypt(seed, this.master), key), component.props.message.content);
        } catch (err) { return } // Ignore errors such as non empty

        component.props.message.bd_encrypted = true;

        // Create a new message to parse it properly
        const create = Message.create(MessageParser.createMessage(currentChannel, MessageParser.parse(currentChannel, decrypt).content));
        if (!create.content || !create.contentParsed) return;

        component.props.message.content = create.content;
        component.props.message.contentParsed = create.contentParsed;
    }

    renderMessageContent(component, args, retVal) {
        if (!component.props.message.bd_encrypted) return;
        retVal.props.children[0].props.children.props.children.props.children.unshift(VueInjector.createReactElement(E2EEMessageButton));
    }

    beforeRenderImageWrapper(component, args, retVal) {
        if (!component.props || !component.props.src) return;
        if (component.props.decrypting) return;
        component.props.decrypting = true;

        const src = component.props.original || component.props.src.split('?')[0];
        if (!src.includes('bde2ee')) return;
        component.props.className = 'bd-encryptedImage';

        const haveKey = this.getKey(DiscordApi.currentChannel.id);
        if (!haveKey) return;

        const cached = Cache.find('e2ee:images', item => item.src === src);
        if (cached) {
            if (cached.invalidKey) {
                component.props.className = 'bd-encryptedImage bd-encryptedImageBadKey';
                component.props.readyState = 'READY';
                return;
            }
            Logger.info('E2EE', 'Returning encrypted image from cache');
            try {
                const decrypt = this.decrypt(this.decrypt(this.decrypt(seed, this.master), haveKey), cached.image);
                component.props.className = 'bd-decryptedImage';
                component.props.src = component.props.original = 'data:;base64,' + decrypt;
            } catch (err) { return } finally { component.props.readyState = 'READY' }
            return;
        }

        component.props.readyState = 'LOADING';
        Logger.info('E2EE', 'Decrypting image: ' + src);
        request.get(src, { encoding: 'binary' }).then(res => {
            (async () => {
                const arr = new Uint8Array(new ArrayBuffer(res.length));
                for (let i = 0; i < res.length; i++) arr[i] = res.charCodeAt(i);

                const aobindex = Utils.aobscan(arr, [73, 69, 78, 68]) + 8;
                const sliced = arr.slice(aobindex);
                const image = new TextDecoder().decode(sliced);

                const hmac = image.slice(-64);
                const data = image.slice(0, -64);
                const validateHmac = await this.createHmac(data);
                if (hmac !== validateHmac) {
                    Cache.push('e2ee:images', { src, invalidKey: true });
                    if (component && component.props) component.props.readyState = 'READY';
                    return;
                }

                Cache.push('e2ee:images', { src, image: data });

                if (!component || !component.props) {
                    Logger.warn('E2EE', 'Component seems to be gone');
                    return;
                }

                component.props.decrypting = false;
                component.forceUpdate();
            })();
        }).catch(err => {
            console.log('request error', err);
        });
    }

    patchChannelTextArea(cta) {
        MonkeyPatch('BD:E2EE', cta.component.prototype).after('render', this.renderChannelTextArea);
    }

    renderChannelTextArea(component, args, retVal) {
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];
        const inner = retVal.props.children.find(child => child.props.className && child.props.className.includes('inner'));
        inner.props.children.splice(0, 0, VueInjector.createReactElement(E2EEComponent));
    }

    patchChannelTextAreaSubmit(cta) {
        MonkeyPatch('BD:E2EE', cta.component.prototype).before('handleSubmit', this.handleChannelTextAreaSubmit.bind(this));
    }

    handleChannelTextAreaSubmit(component, args, retVal) {
        const key = this.getKey(DiscordApi.currentChannel.id);
        if (!this.encryptNewMessages || !key) return;
        component.props.value = this.encrypt(this.decrypt(this.decrypt(seed, this.master), key), component.props.value, '$:');
    }

    async disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        ctaComponent.forceUpdateAll();
    }

}
