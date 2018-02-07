/**
 * BetterDiscord Guild Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordEvent from './discordevent';

export class GUILD_CREATE extends DiscordEvent {
    get afkChannelId() { return this.args.afkChannelId }
    get afkTimeout() { return this.args.afkTimeout }
    get applicationId() { return this.args.applicationId }
    get defaultMessageNotifications() { return this.args.defaultMessageNotifications }
    get emojis() { return this.args.emojis }
    get explicitContentFilter() { return this.args.explicitContentFilter }
    get features() { return this.args.features }
    get icon() { return this.args.icon }
    get id() { return this.args.id }
    get joinedAt() { return this.args.joinedAt }
    get large() { return this.args.large }
    get memberCount() { return this.args.memberCount }
    get mfaLevel() { return this.args.mfaLevel }
    get name() { return this.args.name }
    get ownerId() { return this.args.ownerId }
    get presences() { return this.args.presences }
    get region() { return this.args.region }
    get roles() { return this.args.roles }
    get splash() { return this.args.splash }
    get systemChannelId() { return this.args.systemChannelId }
    get unavailable() { return this.args.unavailable }
    get verificationLevel() { return this.args.verificationLevel }
    get voiceStates() { return this.args.voiceStates }
    get channels() { return this.args.channels }
    get members() { return this.args.members }
}

export class GUILD_DELETE extends DiscordEvent {
    get id() { return this.args.id }
    get unavailable() { return this.args.unavailable }
}

export class GUILD_SYNC extends DiscordEvent {
    get id() { return this.args.id }
    get large() { return this.args.large }
    get members() { return this.args.members }
    get presences() { return this.args.presences }
}

export class GUILD_MEMBERS_CHUNK extends DiscordEvent {}

export class GUILD_BAN_ADD extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get user() { return this.args.suer }
}

export class GUILD_BAN_REMOVE extends GUILD_BAN_ADD {}

export class GUILD_MEMBER_ADD extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get joinedAt() { return this.args.joinedAt }
    get mute() { return this.args.mute }
    get deaf() { return this.args.deaf }
    get roles() { return this.args.roles }
    get user() { return this.args.user }
}

export class GUILD_MEMBER_UPDATE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get nick() { return this.args.nick }
    get roles() { return this.args.roles }
    get user() { return this.args.user }
}

export class GUILD_MEMBER_REMOVE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get user() { return this.args.user }
}

export class GUILD_ROLE_CREATE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get role() { return this.args.role }
}

export class GUILD_ROLE_UPDATE extends GUILD_ROLE_CREATE {}

export class GUILD_ROLE_DELETE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get roleId() { return this.args.roleId }
}

export class GUILD_EMOJIS_UPDATE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get emojis() { return this.args.emojis }
}

export class GUILD_INTEGRATIONS_UPDATE extends DiscordEvent {}
