/**
 * BetterDiscord Discord API User Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordApi, { Modules } from 'discordapi';

/**
 * A Discord user account.
 */
export class User {

    constructor(data) {
        for (let key in data) this[key] = data[key];
        this.discordObject = data;
    }

    static fromId(id) {
        return new User(Modules.UserStore.getUser(id));
    }

    /**
     * Sends a private message to this user.
     * @param {String} content The message to send
     * @param {Boolean} parse Whether to parse special identifiers such as mentions
     */
    async sendMessage(content, parse = true) {
        let id = await Modules.PrivateChannelActions.ensurePrivateChannel(DiscordApi.currentUser.id, this.id);
        let channel = new PrivateChannel(Modules.ChannelStore.getChannel(id));
        channel.sendMessage(content, parse);
    }

    /**
     * Checks if the user is friends with the current user.
     */
    get isFriend() {
        return Modules.RelationshipStore.isFriend(this.id);
    }

    /**
     * Checks if the user is blocked by the current user.
     */
    get isBlocked() {
        return Modules.RelationshipStore.isBlocked(this.id);
    }

    /**
     * Sends a friend request to the user.
     */
    addFriend() {
        Modules.RelationshipManager.addRelationship(this.id, {location: 'Context Menu'});
    }

    /**
     * Removes the user as a friend.
     */
    removeFriend() {
        Modules.RelationshipManager.removeRelationship(this.id, {location: 'Context Menu'});
    }

    /**
     * Blocks the user.
     */
    block() {
        Modules.RelationshipManager.addRelationship(this.id, {location: 'Context Menu'}, Modules.DiscordConstants.RelationshipTypes.BLOCKED);
    }

    /**
     * Unblocks the user.
     */
    unblock() {
        Modules.RelationshipManager.removeRelationship(this.id, {location: 'Context Menu'});
    }

}

/**
 * A Discord user account as a member of a guild.
 */
export class Member extends User {
    constructor(data, guild) {
        super(data);
        const userData = Modules.UserStore.getUser(data.userId);
        for (let key in userData) this[key] = userData[key];
        this.guild_id = guild;
    }

    /**
     * Checks the current user's permissions in this guild.
     * @param {Any} perms
     */
    checkPermissions(perms) {
        return Modules.PermissionUtils.can(perms, DiscordApi.currentUser, Modules.GuildStore.getGuild(this.guild_id));
    }

    /**
     * Kicks the user from the guild.
     * @param {String} reason
     */
    kick(reason = '') {
        if (!this.checkPermissions(Modules.DiscordPermissions.KICK_MEMBERS)) throw new InsufficientPermissions('KICK_MEMBERS');
        Modules.GuildActions.kickUser(this.guild_id, this.id, reason);
    }

    /**
     * Bans the user from the guild.
     * @param {Number} daysToDelete
     * @param {String} reason
     */
    ban(daysToDelete = '1', reason = '') {
        if (!this.checkPermissions(Modules.DiscordPermissions.BAN_MEMBERS)) throw new InsufficientPermissions('BAN_MEMBERS');
        Modules.GuildActions.banUser(this.guild_id, this.id, daysToDelete, reason);
    }

    /**
     * Unbans the user from the guild.
     */
    unban() {
        if (!this.checkPermissions(Modules.DiscordPermissions.BAN_MEMBERS)) throw new InsufficientPermissions('BAN_MEMBERS');
        Modules.GuildActions.unbanUser(this.guild_id, this.id);
    }

    /**
     * Moves the user to another voice channel in the guild.
     */
    move(channel_id) {
        if (!this.checkPermissions(Modules.DiscordPermissions.MOVE_MEMBERS)) throw new InsufficientPermissions('MOVE_MEMBERS');
        Modules.GuildActions.setChannel(this.guild_id, this.id, channel_id);
    }

    /**
     * Mutes the user for all members of the guild.
     */
    mute(active = true) {
        if (!this.checkPermissions(Modules.DiscordPermissions.MUTE_MEMBERS)) throw new InsufficientPermissions('MUTE_MEMBERS');
        Modules.GuildActions.setServerMute(this.guild_id, this.id, active);
    }

    /**
     * Unmutes the user for all members of the guild.
     */
    unmute(active = true) {
        this.mute(false);
    }

    /**
     * Deafens the user for all members of the guild.
     */
    deafen(active = true) {
        if (!this.checkPermissions(Modules.DiscordPermissions.DEAFEN_MEMBERS)) throw new InsufficientPermissions('DEAFEN_MEMBERS');
        Modules.GuildActions.setServerDeaf(this.guild_id, this.id, active);
    }

    /**
     * Undeafens the user for all members of the guild.
     */
    undeafen(active = true) {
        this.deafen(false);
    }
}
