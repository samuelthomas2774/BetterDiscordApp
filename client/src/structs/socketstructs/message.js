/**
 * BetterDiscord Message Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DiscordApi } from 'modules';
import { Reflection } from 'ui';
import DiscordEvent from './discordevent';

export class MessageEvent extends DiscordEvent {
    get id() { return this.args.id }
    get authorId() { return this.args.author }
    get channelId() { return this.args.channelId }
    get content() { return this.args.content }
    get attachments() { return this.args.attachments }
    get editedTimestamp() { return this.args.editedTimestamp }
    get embeds() { return this.args.embeds }
    get mentionEveryone() { return this.args.mentionEveryone }
    get mentionRoles() { return this.args.mentionRoles }
    get mentions() { return this.args.mentions }
    get nonce() { return this.args.nonce }
    get pinned() { return this.args.pinned }
    get timestamp() { return this.args.timestamp }
    get tts() { return this.args.tts }
    get type() { return this.args.type }

    get channel() {
        return DiscordApi.Channel.fromId(this.channelId);
    }

    get message() {
        return this.channel.messages.find(m => m.id === this.id);
    }

    get author() {
        return DiscordApi.User.fromId(this.authorId);
    }

    get element() {
        const find = document.querySelector(`[message-id="${this.id}"]`);
        if (find) return find;
        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        if (Reflection(lastMessage).prop('message.id') === this.id) return lastMessage;
        return null;
    }
}

export class MESSAGE_CREATE extends MessageEvent {}
export class MESSAGE_UPDATE extends MessageEvent {}

export class MESSAGE_DELETE extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get messageId() { return this.args.messageId }

    get channel() {
        return DiscordApi.Channel.fromId(this.channelId);
    }

    get message() {
        return this.channel.messages.find(m => m.id === this.messageId);
    }
}

// TODO
export class MESSAGE_DELETE_BULK extends DiscordEvent {}

export class MESSAGE_ACK extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get messageId() { return this.args.messageId }

    get channel() {
        return DiscordApi.Channel.fromId(this.channelId);
    }

    get message() {
        return this.channel.messages.find(m => m.id === this.messageId);
    }
}

export class MessageReactionEvent extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get messageId() { return this.args.messageId }
    get userId() { return this.args.userId }
    get emoji() { return this.args.emoji }

    get channel() {
        return DiscordApi.Channel.fromId(this.channelId);
    }

    get message() {
        return this.channel.messages.find(m => m.id === this.messageId);
    }

    get user() {
        return DiscordApi.User.fromId(this.userId);
    }
}

export class MESSAGE_REACTION_ADD extends MessageReactionEvent {}
export class MESSAGE_REACTION_REMOVE extends MessageReactionEvent {}
