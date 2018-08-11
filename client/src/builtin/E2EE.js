/**
 * BetterDiscord E2EE Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings } from 'modules';
import BuiltinModule from './BuiltinModule';
import { WebpackModules, ReactComponents, MonkeyPatch, Patcher, DiscordApi } from 'modules';
import { VueInjector, Reflection } from 'ui';
import E2EEComponent from './E2EEComponent.vue';
import aes256 from 'aes256';

let seed = Math.random().toString(36).replace(/[^a-z]+/g, '');

export default new class E2EE extends BuiltinModule {

    constructor() {
        super();
        this.master = this.encrypt(seed, 'temporarymasterkey');
    }

    setMaster(key) {
        seed = Math.random().toString(36).replace(/[^a-z]+/g, '');
        const newMaster = this.encrypt(seed, key);
        // TODO re-encrypt everything with new master
        return (this.master = newMaster);
    }

    get settingPath() {
        return ['security', 'default', 'e2ee'];
    }

    get database() {
        return Settings.getSet('security').settings.find(s => s.id === 'e2eedb').settings[0].value;
    }

    encrypt(key, content, prefix = '') {
        return prefix + aes256.encrypt(key, content);
    }

    decrypt(key, content, prefix = '') {
        return aes256.decrypt(key, content.replace(prefix, ''));
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
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).before('render', this.renderMessageContent.bind(this));
    }

    renderMessageContent(component, args, retVal) {
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

        // Create a new message to parse it properly
        const create  = Message.create(MessageParser.createMessage(currentChannel, MessageParser.parse(currentChannel, decrypt).content));
        if (!create.content || !create.contentParsed) return;

        component.props.message.content = create.content;
        component.props.message.contentParsed = create.contentParsed;
    }

    patchChannelTextArea(cta) {
        MonkeyPatch('BD:E2EE', cta.component.prototype).after('render', this.renderChannelTextArea);
    }

    renderChannelTextArea(component, args, retVal) {
        if (!(retVal.props.children instanceof Array)) retVal.props.children = [retVal.props.children];
        const inner = retVal.props.children.find(child => child.props.className && child.props.className.includes('inner'));
        inner.props.children.splice(0, 0, VueInjector.createReactElement(E2EEComponent, {}, false));
    }

    patchChannelTextAreaSubmit(cta) {
        MonkeyPatch('BD:E2EE', cta.component.prototype).before('handleSubmit', this.handleChannelTextAreaSubmit.bind(this));
    }

    handleChannelTextAreaSubmit(component, args, retVal) {
        const key = this.getKey(DiscordApi.currentChannel.id);
        if (!key) return;
        component.props.value = this.encrypt(this.decrypt(this.decrypt(seed, this.master), key), component.props.value, '$:');
    }

    async disabled(e) {
        for (const patch of Patcher.getPatchesByCaller('BD:E2EE')) patch.unpatch();
        const ctaComponent = await ReactComponents.getComponent('ChannelTextArea');
        ctaComponent.forceUpdateAll();
    }

}
