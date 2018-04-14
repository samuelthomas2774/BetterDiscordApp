/**
 * BetterDiscord Guild Struct
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
import { GuildMember } from './user';

const roles = new WeakMap();

export class Role {
    constructor(data, guild_id) {
        if (roles.has(data)) return roles.get(data);
        roles.set(data, this);

        this.discordObject = data;
        this.guild_id = guild_id;
    }

    get id() { return this.discordObject.id }
    get name() { return this.discordObject.name }
    get position() { return this.discordObject.position }
    get original_position() { return this.discordObject.originalPosition }
    get permissions() { return this.discordObject.permissions }
    get managed() { return this.discordObject.managed }
    get mentionable() { return this.discordObject.mentionable }
    get hoist() { return this.discordObject.hoist }
    get colour() { return this.discordObject.color }
    get colour_string() { return this.discordObject.colorString }

    get guild() {
        return Guild.fromId(this.guild_id);
    }

    get members() {
        return this.guild.members.filter(m => m.roles.includes(this));
    }
}

const emojis = new WeakMap();

export class Emoji {
    constructor(data, guild_id) {
        if (emojis.has(data)) return emojis.get(data);
        emojis.set(data, this);

        this.discordObject = data;
        // this.guild_id = guild_id;
    }

    get id() { return this.discordObject.id }
    get guild_id() { return this.discordObject.guild_id }
    get name() { return this.discordObject.name }
    get managed() { return this.discordObject.managed }
    get animated() { return this.discordObject.animated }
    get all_names_string() { return this.discordObject.allNamesString }
    get require_colons() { return this.discordObject.require_colons }
    get url() { return this.discordObject.url }
    get roles() { return this.discordObject.roles }

    get guild() {
        return Guild.fromId(this.guild_id);
    }
}

const guilds = new WeakMap();

export class Guild {

    constructor(data) {
        if (guilds.has(data)) return guilds.get(data);
        guilds.set(data, this);

        this.discordObject = data;
    }

    static from(data) {
        return new Guild(data);
    }

    static fromId(id) {
        const guild = Modules.GuildStore.getGuild(id);
        if (guild) return Guild.from(guild);
    }

    static get Role() { return Role }
    static get Emoji() { return Emoji }

    get id() { return this.discordObject.id }
    get owner_id() { return this.discordObject.ownerId }
    get application_id() { return this.discordObject.application_id }
    get system_channel_id() { return this.discordObject.systemChannelId }
    get name() { return this.discordObject.name }
    get acronym() { return this.discordObject.acronym }
    get icon() { return this.discordObject.icon }
    get joined_at() { return this.discordObject.joinedAt }
    get verification_level() { return this.discordObject.verificationLevel }
    get mfa_level() { return this.discordObject.mfaLevel }
    get large() { return this.discordObject.large }
    get lazy() { return this.discordObject.lazy }
    get voice_region() { return this.discordObject.region }
    get afk_channel_id() { return this.discordObject.afkChannelId }
    get afk_timeout() { return this.discordObject.afkTimeout }
    get explicit_content_filter() { return this.discordObject.explicitContentFilter }
    get default_message_notifications() { return this.discordObject.defaultMessageNotifications }
    get splash() { return this.discordObject.splash }
    get features() { return this.discordObject.features }

    get owner() {
        return this.members.find(m => m.id === this.owner_id);
    }

    get roles() {
        return List.from(Object.entries(this.discordObject.roles), ([i, r]) => new Role(r, this.id))
            .sort((r1, r2) => r1.position === r2.position ? 0 : r1.position > r2.position ? 1 : -1);
    }

    get channels() {
        const channels = Modules.GuildChannelsStore.getChannels(this.id);
        const returnChannels = new List();
        for (const category in channels) {
            if (channels.hasOwnProperty(category)) {
                if (!Array.isArray(channels[category])) continue;
                const channelList = channels[category];
                for (const channel of channelList) {
                    // For some reason Discord adds a new category with the ID "null" and name "Uncategorized"
                    if (channel.channel.id === 'null') continue;
                    returnChannels.push(Channel.from(channel.channel));
                }
            }
        }
        return returnChannels;
    }

    /**
     * Channels that don't have a parent. (Channel categories and any text/voice channel not in one.)
     */
    get main_channels() {
        return this.channels.filter(c => !c.parent_id);
    }

    /**
     * The guild's default channel. (Usually the first in the list.)
     */
    get default_channel() {
        return Channel.from(Modules.GuildChannelsStore.getDefaultChannel(this.id));
    }

    /**
     * A list of GuildMember objects.
     */
    get members() {
        const members = Modules.GuildMemberStore.getMembers(this.id);
        return List.from(members, m => new GuildMember(m, this.id));
    }

    get currentUser() {
        return this.members.find(m => m.user === DiscordApi.currentUser);
    }

    /**
     * The total number of members in the guild.
     */
    get member_count() {
        return Modules.MemberCountStore.getMemberCount(this.id);
    }

    /**
     * An array of the guild's custom emojis.
     */
    get emojis() {
        return List.from(Modules.EmojiUtils.getGuildEmoji(this.id), e => new Emoji(e, this.id));
    }

    get permissions() {
        return Modules.GuildPermissions.getGuildPermissions(this.id);
    }

    getMember(id) {
        const member = Modules.GuildMemberStore.getMember(this.id, id);
        if (member) return new GuildMember(member, this.id);
    }

    isMember(id) {
        return Modules.GuildMemberStore.isMember(this.id, id);
    }

    /**
     * Whether the user has not restricted direct messages from members of this guild.
     */
    get allow_dms() {
        return !DiscordApi.UserSettings.restricted_guild_ids.includes(this.id);
    }

    /**
     * Marks all messages in the guild as read.
     */
    markAsRead() {
        Modules.GuildActions.markGuildAsRead(this.id);
    }

    /**
     * Selects the guild in the UI.
     */
    select() {
        Modules.GuildActions.selectGuild(this.id);
    }

    /**
     * Opens this guild's settings window.
     * @param {String} section The section to open (see DiscordConstants.GuildSettingsSections)
     */
    openSettings(section = 'OVERVIEW') {
        Modules.GuildSettingsWindow.open(this.id);
        Modules.GuildSettingsWindow.setSection(section);
    }

    /**
     * Kicks members who don't have any roles and haven't been seen in the number of days passed.
     * @param {Number} days
     */
    pruneMembers(days) {
        Modules.PruneMembersModal.prune(this.id, days);
    }

    openPruneMumbersModal() {
        Modules.PruneMembersModal.open(this.id);
    }

    /**
     * Opens the create channel modal for this guild.
     * @param {Number} type The type of channel to create - either 0 (text), 2 (voice) or 4 (category)
     * @param {ChannelCategory} category The category to create the channel in
     * @param {GuildChannel} clone A channel to clone permissions of
     */
    openCreateChannelModal(type = 0, category, clone) {
        Modules.CreateChannelModal.open(type, this.id, category ? category.id : undefined, clone ? clone.id : undefined);
    }

    openNotificationSettingsModal() {
        Modules.NotificationSettingsModal.open(this.id);
    }

    openPrivacySettingsModal() {
        Modules.PrivacySettingsModal.open(this.id);
    }

    nsfwAgree() {
        Modules.GuildActions.nsfwAgree(this.id);
    }

    nsfwDisagree() {
        Modules.GuildActions.nsfwDisagree(this.id);
    }

    /**
     * Changes the guild's position in the list.
     * @param {Number} index The new position
     */
    changeSortLocation(index) {
        Modules.GuildActions.move(DiscordApi.guildPositions.indexOf(this.id), index);
    }

}
