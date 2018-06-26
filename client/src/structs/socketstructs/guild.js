/**
 * BetterDiscord Guild Event Structs
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DiscordApi } from 'modules';
import DiscordEvent from './discordevent';

export class GUILD_CREATE extends DiscordEvent {
    get id() { return this.args.id }
    get ownerId() { return this.args.ownerId }
    get systemChannelId() { return this.args.systemChannelId }
    get afkChannelId() { return this.args.afkChannelId }
    get afkTimeout() { return this.args.afkTimeout }
    get applicationId() { return this.args.applicationId }
    get defaultMessageNotifications() { return this.args.defaultMessageNotifications }
    get emojis() { return this.args.emojis }
    get explicitContentFilter() { return this.args.explicitContentFilter }
    get features() { return this.args.features }
    get icon() { return this.args.icon }
    get joinedAt() { return this.args.joinedAt }
    get large() { return this.args.large }
    get memberCount() { return this.args.memberCount }
    get mfaLevel() { return this.args.mfaLevel }
    get name() { return this.args.name }
    get presences() { return this.args.presences }
    get region() { return this.args.region }
    get roles() { return this.args.roles }
    get splash() { return this.args.splash }
    get unavailable() { return this.args.unavailable }
    get verificationLevel() { return this.args.verificationLevel }
    get voiceStates() { return this.args.voiceStates }
    get channels() { return this.args.channels }
    get members() { return this.args.members }

    get guild() {
        return DiscordApi.Guild.fromId(this.id);
    }

    get owner() {
        return this.guild.owner;
    }

    get systemChannel() {
        return DiscordApi.Channel.fromId(this.systemChannelId);
    }

    get afkChannel() {
        return DiscordApi.Channel.fromId(this.afkChannelId);
    }
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

    get guild() {
        return DiscordApi.Guild.fromId(this.id);
    }
}

export class GUILD_MEMBERS_CHUNK extends DiscordEvent {}

export class GuildBanEvent extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get userId() { return this.args.user }

    get guild() {
        return DiscordApi.Guild.fromId(this.id);
    }

    get user() {
        return this.guild.getMember(this.userId);
    }
}

export class GUILD_BAN_ADD extends GuildBanEvent {}
export class GUILD_BAN_REMOVE extends GuildBanEvent {}

export class GuildMemberEvent extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get userId() { return this.args.user }

    get guild() {
        return DiscordApi.Guild.fromId(this.guildId);
    }

    get user() {
        return DiscordApi.User.fromId(this.userId);
    }
}

export class GUILD_MEMBER_ADD extends GuildMemberEvent {
    get joinedAt() { return this.args.joinedAt }
    get mute() { return this.args.mute }
    get deaf() { return this.args.deaf }
    get roleIds() { return this.args.roles }

    get roles() {
        return List.from(this.roleIds, id => this.guild.roles.find(r => r.id === id))
            .sort((r1, r2) => r1.position === r2.position ? 0 : r1.position > r2.position ? 1 : -1);
    }
}

export class GUILD_MEMBER_UPDATE extends GuildMemberEvent {
    get nick() { return this.args.nick }
    get roleIds() { return this.args.roles }

    get roles() {
        return List.from(this.roleIds, id => this.guild.roles.find(r => r.id === id))
            .sort((r1, r2) => r1.position === r2.position ? 0 : r1.position > r2.position ? 1 : -1);
    }
}

export class GUILD_MEMBER_REMOVE extends GuildMemberEvent {}

export class GuildRoleEvent extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get roleId() { return this.args.role }

    get guild() {
        return DiscordApi.Guild.fromId(this.guildId);
    }

    get role() {
        return this.guild.roles.find(r => r.id === this.roleId);
    }
}

export class GUILD_ROLE_CREATE extends GuildRoleEvent {}
export class GUILD_ROLE_UPDATE extends GuildRoleEvent {}

export class GUILD_ROLE_DELETE extends GuildRoleEvent {
    get roleId() { return this.args.roleId }
}

export class GUILD_EMOJIS_UPDATE extends DiscordEvent {
    get guildId() { return this.args.guildId }
    get emojis() { return this.args.emojis }

    get guild() {
        return DiscordApi.Guild.fromId(this.guildId);
    }
}

export class GUILD_INTEGRATIONS_UPDATE extends DiscordEvent {}
