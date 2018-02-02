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

// TODO
export class CHANNEL_CREATE extends DiscordEvent {}

export class CHANNEL_DELETE extends DiscordEvent {}

export class CHANNEL_UPDATE extends DiscordEvent {}

export class CHANNEL_PINS_ACK {
    get channelId() { return this.args.channelId }
    get timestamp() { return this.args.timestamp }
}
