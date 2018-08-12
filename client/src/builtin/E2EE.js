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
import { ClientLogger as Logger } from 'common';
import E2EEComponent from './E2EEComponent.vue';
import E2EEMessageButton from './E2EEMessageButton.vue';
import aes256 from 'aes256';
import crypto from 'crypto';

const userMentionPattern = new RegExp(`<@!?([0-9]{10,})>`, "g");
const roleMentionPattern = new RegExp(`<@&([0-9]{10,})>`, "g");
const everyoneMentionPattern = new RegExp(`(?:\\s+|^)@everyone(?:\\s+|$)`);

let seed = Math.random().toString(36).replace(/[^a-z]+/g, '');

export default new class E2EE extends BuiltinModule {

    constructor() {
        super();
        this.master = this.encrypt(seed, 'temporarymasterkey');
        this.encryptNewMessages = true;
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
        return Settings.getSetting('security', 'e2eedb', 'e2ekvps').value;
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

    setKey(channelId, key) {
        const items = Settings.getSetting('security', 'e2eedb', 'e2ekvps').items;
        const index = items.findIndex(kvp => kvp.value.key === channelId);
        if (index > -1) {
          items[index].value = {key: channelId, value: key};
          return;
        }
        Settings.getSetting('security', 'e2eedb', 'e2ekvps').addItem({ value: { key: channelId, value: key } });
    }

    async enabled(e) {
        this.patchDispatcher();
        this.patchMessageContent();
        const selector = '.' + WebpackModules.getClassName('channelTextArea', 'emojiButton');
        const cta = await ReactComponents.getComponent('ChannelTextArea', { selector });
        this.patchChannelTextArea(cta);
        this.patchChannelTextAreaSubmit(cta);
        cta.forceUpdateAll();
    }

    patchDispatcher() {
        const Dispatcher = WebpackModules.getModuleByName('Dispatcher');
        MonkeyPatch('BD:E2EE', Dispatcher).before('dispatch', (_, [event]) => {
            if (event.type !== "MESSAGE_CREATE") return;

            const key = this.getKey(event.message.channel_id);
            if (!key) return; // We don't have a key for this channel

            if (typeof event.message.content !== 'string') return; // Ignore any non string content
            if (!event.message.content.startsWith('$:')) return; // Not an encrypted string
            let decrypt;
            try {
                decrypt = this.decrypt(this.decrypt(this.decrypt(seed, this.master), key), event.message.content);
            } catch (err) { return } // Ignore errors such as non empty

            const MessageParser = WebpackModules.getModuleByName('MessageParser');
            const Permissions = WebpackModules.getModuleByName('GuildPermissions');
            const DiscordConstants = WebpackModules.getModuleByName('DiscordConstants');
            const currentChannel = DiscordApi.Channel.fromId(event.message.channel_id).discordObject;

            // Create a generic message object to parse mentions with
            const parsed = MessageParser.parse(currentChannel, decrypt).content;

            if (userMentionPattern.test(parsed))
                event.message.mentions = parsed.match(userMentionPattern).map(m => {return {id: m.replace(/[^0-9]/g, '')}});
            if (roleMentionPattern.test(parsed))
                event.message.mention_roles = parsed.match(roleMentionPattern).map(m => m.replace(/[^0-9]/g, ''));
            if (everyoneMentionPattern.test(parsed))
                event.message.mention_everyone = Permissions.can(DiscordConstants.Permissions.MENTION_EVERYONE, currentChannel);
        });
    }

    async patchMessageContent() {
        const selector = '.' + WebpackModules.getClassName('container', 'containerCozy', 'containerCompact', 'edited');
        const MessageContent = await ReactComponents.getComponent('MessageContent', { selector });
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).before('render', this.beforeRenderMessageContent.bind(this));
        MonkeyPatch('BD:E2EE', MessageContent.component.prototype).after('render', this.renderMessageContent.bind(this));
    }

    beforeRenderMessageContent(component) {
        if (!component.props || !component.props.message) return;

        const key = this.getKey(component.props.message.channel_id);
        if (!key) return; // We don't have a key for this channel

        const Message = WebpackModules.getModuleByPrototypes(['isMentioned']);
        const MessageParser = WebpackModules.getModuleByName('MessageParser');
        const Permissions = WebpackModules.getModuleByName('GuildPermissions');
        const DiscordConstants = WebpackModules.getModuleByName('DiscordConstants');
        const currentChannel = DiscordApi.Channel.fromId(component.props.message.channel_id).discordObject;

        if (typeof component.props.message.content !== 'string') return; // Ignore any non string content
        if (!component.props.message.content.startsWith('$:')) return; // Not an encrypted string
        let decrypt;
        try {
            decrypt = this.decrypt(this.decrypt(this.decrypt(seed, this.master), key), component.props.message.content);
        } catch (err) { return } // Ignore errors such as non empty

        component.props.message.bd_encrypted = true; // signal as encrypted

        // Create a generic message object to parse mentions with
        const message = MessageParser.createMessage(currentChannel.id, MessageParser.parse(currentChannel, decrypt).content);

        if (userMentionPattern.test(message.content))
            message.mentions = message.content.match(userMentionPattern).map(m => {return {id: m.replace(/[^0-9]/g, '')}});
        if (roleMentionPattern.test(message.content))
            message.mention_roles = message.content.match(roleMentionPattern).map(m => m.replace(/[^0-9]/g, ''));
        if (everyoneMentionPattern.test(message.content))
            message.mention_everyone = Permissions.can(DiscordConstants.Permissions.MENTION_EVERYONE, currentChannel);

        // Create a new message to parse it properly
        const create = Message.create(message);
        if (!create.content || !create.contentParsed) return;

        component.props.message.mentions = create.mentions;
        component.props.message.mentionRoles = create.mentionRoles;
        component.props.message.mentionEveryone = create.mentionEveryone;
        component.props.message.mentioned = create.mentioned;
        component.props.message.content = create.content;
        component.props.message.contentParsed = create.contentParsed;
    }

    renderMessageContent(component, args, retVal) {
        if (!component.props.message.bd_encrypted) return;

        retVal.props.children[0].props.children.props.children.props.children.unshift(VueInjector.createReactElement(E2EEMessageButton, {
            message: component.props.message
        }));
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

    get ecdh() {
        if (!this._ecdh) this._ecdh = {};
        return this._ecdh;
    }
    
    get ecdh() {
        if (!this._ecdh) this._ecdh = {};
        return this._ecdh;
    }

    createKeyExchange(userID) {
        this.ecdh[userID] = crypto.createECDH('secp521r1');
        return this.ecdh[userID].generateKeys('base64');
    }

    publicKeyFor(userID) {
        return this.ecdh[userID].getPublicKey('base64');
    }

    computeSecret(userID, otherKey) {
        const secret = this.ecdh[userID].computeSecret(otherKey, 'base64', 'base64');
        delete this.ecdh[userID];
        // Hashing the shared secret future-proofs against some possible attacks.
        const hash = crypto.createHash('sha256');
        hash.update(secret);
        return hash.digest('base64');
    }

    createKeyExchange(dmChannelID) {
        this.ecdh[dmChannelID] = crypto.createECDH('secp521r1');
        return this.ecdh[dmChannelID].generateKeys('base64');
    }

    publicKeyFor(dmChannelID) {
        return this.ecdh[dmChannelID].getPublicKey('base64');
    }

    computeSecret(dmChannelID, otherKey) {
        try {
            const secret = this.ecdh[dmChannelID].computeSecret(otherKey, 'base64', 'base64');
            delete this.ecdh[dmChannelID];
            const hash = crypto.createHash('sha256');
            hash.update(secret);
            return hash.digest('base64');
        } catch (e) {
            throw e;
        }
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
