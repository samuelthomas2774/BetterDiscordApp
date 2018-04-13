
import { DiscordApi, DiscordApiModules as Modules } from 'modules';
import { List, InsufficientPermissions } from 'structs';
import { Guild } from './guild';
import { Message } from './message';
import { User, GuildMember } from './user';

export class Channel {

    constructor(data) {
        this.discordObject = data;
    }

    static from(channel) {
        switch (channel.type) {
            default: return new Channel(channel);
            case 0: return new GuildTextChannel(channel);
            case 1: return new DirectMessageChannel(channel);
            case 2: return new GuildVoiceChannel(channel);
            case 3: return new GroupChannel(channel);
            case 4: return new ChannelCategory(channel);
        }
    }

    static fromId(id) {
        const channel = Modules.ChannelStore.getChannel(id);
        if (channel) return Channel.from(channel);
    }

    static get GuildChannel() { return GuildChannel }
    static get GuildTextChannel() { return GuildTextChannel }
    static get GuildVoiceChannel() { return GuildVoiceChannel }
    static get ChannelCategory() { return ChannelCategory }
    static get PrivateChannel() { return PrivateChannel }
    static get DirectMessageChannel() { return DirectMessageChannel }
    static get GroupChannel() { return GroupChannel }

    get id() { return this.discordObject.id }
    get application_id() { return this.discordObject.application_id }
    get type() { return this.discordObject.type }
    get name() { return this.discordObject.name }

    /**
     * Send a message in this channel.
     * @param {String} content The message's new content
     * @param {Boolean} parse Whether to parse the message or send it as it is
     * @return {Promise}
     */
    async sendMessage(content, parse = false) {
        if (this.assertPermissions) this.assertPermissions('SEND_MESSAGES', Modules.DiscordPermissions.VIEW_CHANNEL | Modules.DiscordPermissions.SEND_MESSAGES);
        let response = {};
        if (parse) response = await Modules.MessageActions._sendMessage(this.id, Modules.MessageParser.parse(this.discordObject, content));
        else response = await Modules.MessageActions._sendMessage(this.id, {content});
        return new Message(Modules.MessageStore.getMessage(this.id, response.body.id));
    }

    /**
     * A list of messages in this channel.
     */
    get messages() {
        const messages = Modules.MessageStore.getMessages(this.id).toArray();
        return List.from(messages, m => new Message(m));
    }

    /**
     * Jumps to the latest message in this channel.
     */
    jumpToPresent() {
        if (this.assertPermissions) this.assertPermissions('VIEW_CHANNEL', Modules.DiscordPermissions.VIEW_CHANNEL);
        if (this.hasMoreAfter) Modules.MessageActions.jumpToPresent(this.id, Modules.DiscordConstants.MAX_MESSAGES_PER_CHANNEL);
        else this.messages[this.messages.length - 1].jumpTo(false);
    }

    get hasMoreAfter() {
        return Modules.MessageStore.getMessages(this.id).hasMoreAfter;
    }

    /**
     * Sends an invite in this channel.
     * @param {String} code The invite code
     * @return {Promise}
     */
    async sendInvite(code) {
        if (this.assertPermissions) this.assertPermissions('SEND_MESSAGES', Modules.DiscordPermissions.VIEW_CHANNEL | Modules.DiscordPermissions.SEND_MESSAGES);
        const response = Modules.MessageActions.sendInvite(this.id, code);
        return new Message(Modules.MessageStore.getMessage(this.id, response.body.id));
    }

    /**
     * Opens this channel in the UI.
     */
    select() {
        if (this.assertPermissions) this.assertPermissions('VIEW_CHANNEL', Modules.DiscordPermissions.VIEW_CHANNEL);
        Modules.NavigationUtils.transitionToGuild(this.guild_id ? this.guild_id : Modules.DiscordConstants.ME, this.id);
    }

}

export class GuildChannel extends Channel {
    get guild_id() { return this.discordObject.guild_id }
    get parent_id() { return this.discordObject.parent_id } // Channel category
    get position() { return this.discordObject.position }
    get permission_overwrites() { return this.discordObject.permissionOverwrites }
    get nicks() { return this.discordObject.nicks }

    checkPermissions(perms) {
        return Modules.PermissionUtils.can(perms, DiscordApi.currentUser, this.discordObject);
    }

    assertPermissions(name, perms) {
        if (!this.checkPermissions(perms))
            throw new InsufficientPermissions(name);
    }

    get category() {
        return Channel.fromId(this.parent_id);
    }

    get permissions() {
        return Modules.GuildPermissions.getChannelPermissions(this.id);
    }

    get guild() {
        const guild = Modules.GuildStore.getGuild(this.guild_id);
        if (guild) return new Guild(guild);
    }

    get default_channel() {
        return Modules.GuildChannelsStore.getDefaultChannel(this.guild_id).id === this.id;
    }
}

// Type 0 - GUILD_TEXT
export class GuildTextChannel extends GuildChannel {
    get type() { return 'GUILD_TEXT' }
    get topic() { return this.discordObject.topic }
    get nsfw() { return this.discordObject.nsfw }
}

// Type 2 - GUILD_VOICE
export class GuildVoiceChannel extends GuildChannel {
    get type() { return 'GUILD_VOICE' }
    get user_limit() { return this.discordObject.userLimit }
    get bitrate() { return this.discordObject.bitrate }

    sendMessage() { throw new Error('Cannot send messages in a voice channel.'); }
    get messages() { return []; }
    jumpToPresent() { throw new Error('Cannot select a voice channel.'); }
    get hasMoreAfter() { return false; }
    sendInvite() { throw new Error('Cannot invite someone to a voice channel.'); }
    select() { throw new Error('Cannot select a voice channel.'); }
}

// Type 4 - GUILD_CATEGORY
export class ChannelCategory extends GuildChannel {
    get type() { return 'GUILD_CATEGORY' }
    get parent_id() { return undefined }
    get category() { return undefined }

    sendMessage() { throw new Error('Cannot send messages in a channel category.'); }
    get messages() { return []; }
    jumpToPresent() { throw new Error('Cannot select a channel category.'); }
    get hasMoreAfter() { return false; }
    sendInvite() { throw new Error('Cannot invite someone to a channel category.'); }
    select() { throw new Error('Cannot select a channel category.'); }

    /**
     * A list of channels in this category.
     */
    get channels() {
        return List.from(this.guild.channels, c => c.parent_id === this.id);
    }
}

export class PrivateChannel extends Channel {
    get user_limit() { return this.discordObject.userLimit }
    get bitrate() { return this.discordObject.bitrate }
}

// Type 1 - DM
export class DirectMessageChannel extends PrivateChannel {
    get type() { return 'DM' }
    get recipient_id() { return this.discordObject.recipients[0] }

    /**
     * The other user of this direct message channel.
     */
    get recipient() {
        return User.fromId(this.recipient_id);
    }
}

// Type 3 - GROUP_DM
export class GroupChannel extends PrivateChannel {
    get owner_id() { return this.discordObject.ownerId }
    get type() { return 'GROUP_DM' }
    get icon() { return this.discordObject.icon }

    /**
     * A list of the other members of this group direct message channel.
     */
    get members() {
        return List.from(this.discordObject.recipients, id => User.fromId(id));
    }

    /**
     * The owner of this group direct message channel. This is usually the person who created it.
     */
    get owner() {
        return User.fromId(this.owner_id);
    }
}
