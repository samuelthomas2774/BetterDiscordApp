/**
 * BetterDiscord Discord API Channel Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordApi, { Modules } from 'discordapi';
import { List } from './list';
import { Guild } from './guild';

/**
 * A channel.
 */
export class Channel {

    constructor(data) {
        // for (let key in data) this[key] = data[key];
        this.discordObject = data;
    }

    get application_id() { return this.discordObject.application_id }
    get bitrate() { return this.discordObject.bitrate }
    get guild_id() { return this.discordObject.guild_id }
    get icon() { return this.discordObject.icon }
    get id() { return this.discordObject.id }
    get name() { return this.discordObject.name }
    get nicks() { return this.discordObject.nicks }
    get owner_id() { return this.discordObject.ownerId }
    get parent_id() { return this.discordObject.parent_id }
    get permission_overwrites() { return this.discordObject.permissionOverwrites }
    get position() { return this.discordObject.position }
    get recipients() { return this.discordObject.recipients }
    get topic() { return this.discordObject.topic }
    get type() { return this.discordObject.type }
    get user_limit() { return this.discordObject.user_limit }

    isPrivate() { return this.discordObject.isPrivate() }

    /**
     * Checks the current user's permissions in the channel.
     */
    checkPermissions(perms) {
        return Modules.PermissionUtils.can(perms, DiscordApi.currentUser, this.discordObject) || this.isPrivate();
    }

    /**
     * Sends a message in the channel.
     * @param {String} content
     * @param {Boolean} parse
     * @return {Message}
     */
    async sendMessage(content, parse = true) {
        if (!this.checkPermissions(Modules.DiscordPermissions.VIEW_CHANNEL | Modules.DiscordPermissions.SEND_MESSAGES)) throw new InsufficientPermissions('SEND_MESSAGES');
        let response = {};
        if (parse) response = await Modules.MessageActions._sendMessage(this.id, Modules.MessageParser.parse(this.discordObject, content));
        else response = await Modules.MessageActions._sendMessage(this.id, {content});
        return new Message(Modules.MessageStore.getMessage(this.id, response.body.id));
    }

    /**
     * A list of messages in the channel.
     */
    get messages() {
        let messages = Modules.MessageStore.getMessages(this.id).toArray();
        for (let i in messages) messages[i] = new Message(messages[i]);
        return List.from(messages);
    }

    /**
     * Opens the channel and jumps to the latest message.
     */
    jumpToPresent() {
        if (!this.checkPermissions(Modules.DiscordPermissions.VIEW_CHANNEL)) throw new InsufficientPermissions('VIEW_CHANNEL');
        if (this.hasMoreAfter) Modules.MessageActions.jumpToPresent(this.id, Modules.DiscordConstants.MAX_MESSAGES_PER_CHANNEL);
        else this.messages[this.messages.length - 1].jumpTo(false);
    }

    get hasMoreAfter() {
        return Modules.MessageStore.getMessages(this.id).hasMoreAfter;
    }

    /**
     * Sends an invitation in the channel.
     */
    sendInvite(inviteId) {
        if (!this.checkPermissions(Modules.DiscordPermissions.VIEW_CHANNEL | Modules.DiscordPermissions.SEND_MESSAGES)) throw new InsufficientPermissions('SEND_MESSAGES');
        Modules.MessageActions.sendInvite(this.id, inviteId);
    }

    /**
     * Opens the channel.
     */
    select() {
        if (!this.checkPermissions(Modules.DiscordPermissions.VIEW_CHANNEL)) throw new InsufficientPermissions('VIEW_CHANNEL');
        Modules.NavigationUtils.transitionToGuild(this.guild_id ? this.guild_id : Modules.DiscordConstants.ME, this.id);
    }

}

/**
 * A channel in a guild.
 */
export class GuildChannel extends Channel {

    /**
     * The channel's permissions.
     */
    get permissions() {
        return Modules.GuildPermissions.getChannelPermissions(this.id);
    }

    /**
     * The guild containing the channel.
     */
    get guild() {
        return new Guild(Modules.GuildStore.getGuild(this.guild_id));
    }

    /**
     * Checks if the channel is the parent guild's default channel.
     */
    isDefaultChannel() {
        return Modules.GuildChannelsStore.getDefaultChannel(this.guild_id).id === this.id;
    }

}

/**
 * A direct message thread or group chat.
 */
export class PrivateChannel extends Channel {}
