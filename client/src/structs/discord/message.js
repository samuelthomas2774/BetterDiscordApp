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

const embeds = new WeakMap();

export class Embed {
    constructor(data, message_id, channel_id) {
        if (embeds.has(data)) return embeds.get(data);
        embeds.set(data, this);

        this.discordObject = data;
        this.message_id = message_id;
        this.channel_id = channel_id;
    }

    get title() { return this.discordObject.title }
    get type() { return this.discordObject.type }
    get description() { return this.discordObject.description }
    get url() { return this.discordObject.url }
    get timestamp() { return this.discordObject.timestamp }
    get colour() { return this.discordObject.color }
    get footer() { return this.discordObject.footer }
    get image() { return this.discordObject.image }
    get thumbnail() { return this.discordObject.thumbnail }
    get video() { return this.discordObject.video }
    get provider() { return this.discordObject.provider }
    get author() { return this.discordObject.author }
    get fields() { return this.discordObject.fields }

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

    static from(data) {
        switch (data.type) {
            default: return new Message(data);
            case 0: return new DefaultMessage(data);
            case 1: return new RecipientAddMessage(data);
            case 2: return new RecipientRemoveMessage(data);
            case 3: return new CallMessage(data);
            case 4: return new GroupChannelNameChangeMessage(data);
            case 5: return new GroupChannelIconChangeMessage(data);
            case 6: return new MessagePinnedMessage(data);
            case 7: return new GuildMemberJoinMessage(data);
        }
    }

    static get DefaultMessage() { return DefaultMessage }
    static get RecipientAddMessage() { return RecipientAddMessage }
    static get RecipientRemoveMessage() { return RecipientRemoveMessage }
    static get CallMessage() { return CallMessage }
    static get GroupChannelNameChangeMessage() { return GroupChannelNameChangeMessage }
    static get GroupChannelIconChangeMessage() { return GroupChannelIconChangeMessage }
    static get MessagePinnedMessage() { return MessagePinnedMessage }
    static get GuildMemberJoinMessage() { return GuildMemberJoinMessage }
    static get Reaction() { return Reaction }
    static get Embed() { return Embed }

    get id() { return this.discordObject.id }
    get channel_id() { return this.discordObject.channel_id }
    get nonce() { return this.discordObject.nonce }
    get type() { return this.discordObject.type }
    get timestamp() { return this.discordObject.timestamp }
    get state() { return this.discordObject.state }
    get nick() { return this.discordObject.nick }
    get colour_string() { return this.discordObject.colorString }

    get author() {
        if (this.webhook_id) return this.discordObject.author;
        if (this.discordObject.author) return User.from(this.discordObject.author);
    }

    get channel() {
        return Channel.fromId(this.channel_id);
    }

    get guild() {
        if (this.channel) return this.channel.guild;
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

export class DefaultMessage extends Message {
    get webhook_id() { return this.discordObject.webhookId }
    get type() { return 'DEFAULT' }
    get content() { return this.discordObject.content }
    get content_parsed() { return this.discordObject.contentParsed }
    get invite_codes() { return this.discordObject.invites }
    // get embeds() { return this.discordObject.embeds }
    get attachments() { return this.discordObject.attachments }
    get mention_ids() { return this.discordObject.mentions }
    get mention_role_ids() { return this.discordObject.mentionRoles }
    get mention_everyone() { return this.discordObject.mentionEveryone }
    get edited_timestamp() { return this.discordObject.editedTimestamp }
    get tts() { return this.discordObject.tts }
    get mentioned() { return this.discordObject.mentioned }
    get bot() { return this.discordObject.bot }
    get blocked() { return this.discordObject.blocked }
    get pinned() { return this.discordObject.pinned }
    get activity() { return this.discordObject.activity }
    get application() { return this.discordObject.application }

    get mentions() {
        return List.from(this.mention_ids, id => User.fromId(id));
    }

    get mention_roles() {
        return List.from(this.mention_role_ids, id => this.guild.roles.find(r => r.id === id));
    }

    get embeds() {
        return List.from(this.discordObject.embeds, r => new Embed(r, this.id, this.channel_id));
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
}

export class RecipientAddMessage extends Message {
    get type() { return 'RECIPIENT_ADD' }
    get added_user_id() { return this.discordObject.mentions[0] }

    get added_user() {
        return User.fromId(this.added_user_id);
    }
}

export class RecipientRemoveMessage extends Message {
    get type() { return 'RECIPIENT_REMOVE' }
    get removed_user_id() { return this.discordObject.mentions[0] }

    get removed_user() {
        return User.fromId(this.removed_user_id);
    }

    get user_left() {
        return this.author === this.removed_user;
    }
}

export class CallMessage extends Message {
    get type() { return 'CALL' }
    get mention_ids() { return this.discordObject.mentions }
    get call() { return this.discordObject.call }

    get ended_timestamp() { return this.call.endedTimestamp }

    get mentions() {
        return List.from(this.mention_ids, id => User.fromId(id));
    }

    get participants() {
        return List.from(this.call.participants, id => User.fromId(id));
    }
}

export class GroupChannelNameChangeMessage extends Message {
    get type() { return 'CHANNEL_NAME_CHANGE' }
    get new_name() { return this.discordObject.content }
}

export class GroupChannelIconChangeMessage extends Message {
    get type() { return 'CHANNEL_ICON_CHANGE' }
}

export class MessagePinnedMessage extends Message {
    get type() { return 'CHANNEL_PINNED_MESSAGE' }
}

export class GuildMemberJoinMessage extends Message {
    get type() { return 'GUILD_MEMBER_JOIN' }
}
