/**
 * BetterDiscord Channel Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordEvent from './discordevent';

export class CHANNEL_PINS_UPDATE extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get lastPinTimestamp() { return this.args.lastPinTimestamp }
}

export class CHANNEL_PINS_ACK {
    get channelId() { return this.args.channelId }
    get timestamp() { return this.args.timestamp }
}

export class CHANNEL_CREATE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get id() { return this.args.id }
    get lastMessageId() { return this.args.lastMessageId }
    get name() { return this.args.name }
    get nsfw() { return this.args.nsfw }
    get parentId() { return this.args.parentId }
    get permissionOverwrites() { return this.args.permissionOverwrites }
    get position() { return this.args.position }
    get topic() { return this.args.topic }
    get type() { return this.args.type }
}

export class CHANNEL_UPDATE extends CHANNEL_CREATE { }
export class CHANNEL_DELETE extends CHANNEL_CREATE {}
