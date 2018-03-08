/**
 * BetterDiscord Message Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordEvent from './discordevent';
import { Reflection } from 'ui';

export class MESSAGE_CREATE extends DiscordEvent {
    get author() { return this.args.author }
    get channelId() { return this.args.channelId }
    get content() { return this.args.content }
    get attachments() { return this.args.attachments }
    get editedTimestamp() { return this.args.editedTimestamp }
    get embeds() { return this.args.embeds }
    get id() { return this.args.id }
    get mentionEveryone() { return this.args.mentionEveryone }
    get mentionRoles() { return this.args.mentionRoles }
    get mentions() { return this.args.mentions }
    get nonce() { return this.args.nonce }
    get pinned() { return this.args.pinned }
    get timestamp() { return this.args.timestamp }
    get tts() { return this.args.tts }
    get type() { return this.args.type }
    get element() {
        const find = document.querySelector(`[message-id="${this.id}"]`);
        if (find) return find;
        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        if (Reflection(lastMessage).prop('message.id') === this.id) return lastMessage;
        return null;
    }
}
export class MESSAGE_UPDATE extends MESSAGE_CREATE { }

export class MESSAGE_DELETE extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get messageId() { return this.args.messageId }
}

// TODO
export class MESSAGE_DELETE_BULK extends DiscordEvent {}

export class MESSAGE_ACK extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get messageId() { return this.args.messageId }
}

export class MESSAGE_REACTION_ADD extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get messageId() { return this.args.messageId }
    get userId() { return this.args.userId }
    get emoji() { return this.args.emoji }
}
export class MESSAGE_REACTION_REMOVE extends MESSAGE_REACTION_ADD { }
