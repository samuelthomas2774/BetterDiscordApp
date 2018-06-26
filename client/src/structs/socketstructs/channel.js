/**
 * BetterDiscord Channel Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DiscordApi } from 'modules';
import DiscordEvent from './discordevent';

export class ChannelEvent extends DiscordEvent {
    get id() { return this.args.id }
    get guildId() { return this.args.guildId }
    get parentId() { return this.args.parentId }
    get lastMessageId() { return this.args.lastMessageId }
    get name() { return this.args.name }
    get nsfw() { return this.args.nsfw }
    get permissionOverwrites() { return this.args.permissionOverwrites }
    get position() { return this.args.position }
    get topic() { return this.args.topic }
    get type() { return this.args.type }

    get channel() {
        return DiscordApi.Channel.fromId(this.id);
    }

    get guild() {
        return DiscordApi.Guild.fromId(this.guildId);
    }

    get category() {
        return DiscordApi.Channel.fromId(this.parentId);
    }
}

export class CHANNEL_CREATE extends ChannelEvent {}
export class CHANNEL_UPDATE extends ChannelEvent {}
export class CHANNEL_DELETE extends ChannelEvent {}

export class CHANNEL_PINS_UPDATE extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get lastPinTimestamp() { return this.args.lastPinTimestamp }

    get channel() {
        return DiscordApi.Channel.fromId(this.id);
    }
}

export class CHANNEL_PINS_ACK extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get timestamp() { return this.args.timestamp }

    get channel() {
        return DiscordApi.Channel.fromId(this.id);
    }
}
