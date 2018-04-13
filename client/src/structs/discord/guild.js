
import { DiscordApi, DiscordApiModules as Modules } from 'modules';
import { List } from 'structs';
import { Channel } from './channel';
import { GuildMember } from './user';

export class Guild {

    constructor(data) {
        this.discordObject = data;
    }

    static fromId(id) {
        const guild = Modules.GuildStore.getGuild(id);
        if (guild) return new Guild(guild);
    }

    get id() { return this.discordObject.id }
    get owner_id() { return this.discordObject.owner_id }
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
        return this.members.find(m => m.id === DiscordApi.currentUser.id);
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
        return Modules.EmojiUtils.getGuildEmoji(this.id);
    }

    get permissions() {
        return Modules.GuildPermissions.getGuildPermissions(this.id);
    }

    getMember(id) {
        return new GuildMember(Modules.GuildMemberStore.getMember(this.id, id));
    }

    isMember(id) {
        return Modules.GuildMemberStore.isMember(this.id, id);
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
