/**
 * BetterDiscord Discord API Guild Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordApi, { Modules } from 'discordapi';
import { List } from './list';
import { GuildChannel } from './channel';
import { Member } from './user';

export class Guild {

    constructor(data) {
        for (let key in data) this[key] = data[key];
        this.discordObject = data;
    }

    /**
     * A list of channels in the guild.
     */
    get channels() {
        const channels = Modules.GuildChannelsStore.getChannels(this.id);
        return List.from(channels, channel => new GuildChannel(channel.channel));
    }

    /**
     * The guild's default channel.
     */
    get defaultChannel() {
        return new GuildChannel(Modules.GuildChannelsStore.getDefaultChannel(this.id));
    }

    /**
     * A list of members in the guild.
     */
    get members() {
        const members = Modules.GuildMemberStore.getMembers(this.id);
        return List.from(members, member => new Member(member, this.id));
    }

    /**
     * The number of members in the guild.
     */
    get memberCount() {
        return Modules.MemberCountStore.getMemberCount(this.id);
    }

    /**
     * The guild's custom emoji.
     */
    get emojis() {
        return Modules.EmojiUtils.getGuildEmoji(this.id);
    }

    /**
     * The guild's permissions.
     */
    get permissions() {
        return Modules.GuildPermissions.getGuildPermissions(this.id);
    }

    /**
     * Returns a user as a member of the guild.
     */
    getMember(userId) {
        return Modules.GuildMemberStore.getMember(this.id, userId);
    }

    /**
     * Checks if a user is a member of the guild.
     */
    isMember(userId) {
        return Modules.GuildMemberStore.isMember(this.id, userId);
    }

    /**
     * Marks all messages in the guild as read.
     */
    markAsRead() {
        Modules.GuildActions.markGuildAsRead(this.id);
    }

    /**
     * Selects the guild.
     */
    select() {
        Modules.GuildActions.selectGuild(this.id);
    }

    /**
     * Consents to accessing NSFW channels in the guild.
     */
    nsfwAgree() {
        Modules.GuildActions.nsfwAgree(this.id);
    }

    /**
     * Revokes consent to accessing NSFW channels in the guild.
     */
    nsfwDisagree() {
        Modules.GuildActions.nsfwDisagree(this.id);
    }

    /**
     * Moves the guild in the list.
     */
    changeSortLocation(index) {
        Modules.GuildActions.move(DiscordApi.guildPositions.indexOf(this.id), index);
    }

}
