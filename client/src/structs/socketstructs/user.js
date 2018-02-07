/**
 * BetterDiscord User Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordEvent from './discordevent';

export class RELATIONSHIP_ADD extends DiscordEvent {
    get id() { return this.args.id }
    get type() { return this.args.type }
    // 1 = friend added, 2 = blocked, 3 = friend request received, 4 = friend request sent
    get user() { return this.args.user }
}

export class RELATIONSHIP_REMOVE extends DiscordEvent {
    get id() { return this.args.id }
    // 1 = friend removed, 2 = unblocked
    get type() { return this.args.type }
}

export class TYPING_START extends DiscordEvent {
    get channelId() { return this.args.channelId }
    get userId() { return this.args.userId }
}

export class PRESENCE_UPDATE extends DiscordEvent {
    get game() { return this.args.game }
    get guildId() { return this.args.guildId }
    get nick() { return this.args.nick }
    get roles() { return this.args.roles }
    get status() { return this.args.status }
    get user() { return this.args.user }
    get lastModified() { return this.args.lastModified }
}

// Doesn't have everything and not everything is always set
export class USER_SETTINGS_UPDATE extends DiscordEvent {
    get status() { return this.args.status }
    get messageDisplayCompact() { return this.args.messageDisplayCompact }
    get theme() { return this.args.theme }
    get restrictedGuilds() { return this.args.restrictedGuilds }
}

export class USER_GUILD_SETTINGS_UPDATE extends DiscordEvent {
    get channelOverrides() { return this.args.channelOverrides }
    get guildId() { return this.args.guildId }
    get messageNotifications() { return this.args.messageNotifications }
    get mobilePush() { return this.args.mobilePush }
    get muted() { return this.args.muted }
    get suppressEveryone() { return this.args.suppressEveryone }
}
