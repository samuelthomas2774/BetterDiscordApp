/**
 * BetterDiscord Message Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DiscordApi, DiscordApiModules as Modules } from 'modules';
import { List } from 'structs';
import { Channel } from './channel';
import { User } from './user';

const reactions = new WeakMap();

export class Reaction {
    constructor(data, message_id, channel_id) {
        if (reactions.has(data)) return reactions.get(data);
        reactions.set(data, this);

        this.discordObject = data;
        this.message_id = message_id;
        this.channel_id = channel_id;
    }

    get emoji() {
        const id = this.discordObject.emoji.id;
        if (!id || !this.guild) return this.discordObject.emoji;
        return this.guild.emojis.find(e => e.id === id);
    }

    get count() { return this.discordObject.count }
    get me() { return this.discordObject.me }

    get channel() {
        return Channel.fromId(this.channel_id);
    }

    get message() {
        if (this.channel) return this.channel.messages.find(m => m.id === this.message_id);
    }

    get guild() {
        if (this.channel) return this.channel.guild;
    }
}

const messages = new WeakMap();

export class Message {

    constructor(data) {
        if (messages.has(data)) return messages.get(data);
        messages.set(data, this);

        this.discordObject = data;
    }

    static get Reaction() { return Reaction }

    get id() { return this.discordObject.id }
    get channel_id() { return this.discordObject.channel_id }
    get webhook_id() { return this.discordObject.webhookId }
    get nonce() { return this.discordObject.nonce }
    get type() { return this.discordObject.type }
    get content() { return this.discordObject.content }
    get content_parsed() { return this.discordObject.contentParsed }
    get invite_codes() { return this.discordObject.invites }
    get embeds() { return this.discordObject.embeds }
    get attachments() { return this.discordObject.attachments }
    get mentions() { return this.discordObject.mentions }
    get mention_roles() { return this.discordObject.mentionRoles }
    get mention_everyone() { return this.discordObject.mentionEveryone }
    get timestamp() { return this.discordObject.timestamp }
    get edited_timestamp() { return this.discordObject.editedTimestamp }
    get state() { return this.discordObject.state }
    get tts() { return this.discordObject.tts }
    get mentioned() { return this.discordObject.mentioned }
    get bot() { return this.discordObject.bot }
    get blocked() { return this.discordObject.blocked }
    get pinned() { return this.discordObject.pinned }
    get nick() { return this.discordObject.nick }
    get colour_string() { return this.discordObject.colorString }
    get application() { return this.discordObject.application }
    get activity() { return this.discordObject.activity }
    get call() { return this.discordObject.call }

    get author() {
        if (this.discordObject.author)
            return new User(this.discordObject.author);
    }

    get channel() {
        return Channel.fromId(this.channel_id);
    }

    get guild() {
        if (this.channel) return this.channel.guild;
    }

    get reactions() {
        return List.from(this.discordObject.reactions, r => new Reaction(r, this.id, this.channel_id));
    }

    get edited() {
        return !!this.edited_timestamp;
    }

    /**
     * Programmatically update the message's content.
     * TODO: how do we know if the message was updated successfully?
     * @param {String} content The message's new content
     * @param {Boolean} parse Whether to parse the message or update it as it is
     */
    edit(content, parse = false) {
        if (this.author !== DiscordApi.currentUser)
            throw new Error('Cannot edit messages sent by other users.');
        if (parse) Modules.MessageActions.editMessage(this.channel_id, this.id, Modules.MessageParser.parse(this.discordObject, content));
        else Modules.MessageActions.editMessage(this.channel_id, this.id, {content});
    }

    /**
     * Start the edit mode of the UI.
     */
    startEdit() {
        if (this.author !== DiscordApi.currentUser)
            throw new Error('Cannot edit messages sent by other users.');
        Modules.MessageActions.startEditMessage(this.channel_id, this.id, this.content);
    }

    /**
     * Exit the edit mode of the UI.
     */
    endEdit() {
        Modules.MessageActions.endEditMessage();
    }

    /**
     * Deletes the message.
     * TODO: how do we know if the message was deleted successfully?
     */
    delete() {
        Modules.MessageActions.deleteMessage(this.channel_id, this.id);
    }

    /**
     * Jumps to the message.
     */
    jumpTo(flash = true) {
        Modules.MessageActions.jumpToMessage(this.channel_id, this.id, flash);
    }

}
