/**
 * BetterDiscord Generic Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordEvent from './discordevent';

export class VOICE_STATE_UPDATE extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get deaf() { return this.args.deaf }
    get guildId() { return this.args.guildId }
    get mute() { return this.args.mute }
    get selfDeaf() { return this.args.selfDeaf }
    get selfMute() { return this.args.selfMute }
    get selfVideo() { return this.args.selfVideo }
    get sessionId() { return this.args.sessionId }
    get suppress() { return this.args.suppress }
    get userId() { return this.args.userId }
}

export class ACTIVITY_START extends DiscordEvent {}
