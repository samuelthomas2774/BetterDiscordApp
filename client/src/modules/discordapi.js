/**
 * BetterDiscord Discord API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import WebpackModules from './webpackmodules';
import { $ } from 'vendor';

import { List, User, Member, Guild, Channel, GuildChannel, PrivateChannel, Message } from 'discordstructs';

export const Modules = {
    _getModule(name) {
        let foundModule = WebpackModules.getModuleByName(name);
        if (!foundModule) return null;
        delete this[name];
        return this[name] = foundModule;
    },

    get ChannelSelector() { return this._getModule('ChannelSelector'); },
    get MessageActions() { return this._getModule('MessageActions'); },
    get MessageParser() { return this._getModule('MessageParser'); },
    get MessageStore() { return this._getModule('MessageStore'); },
    get EmojiUtils() { return this._getModule('EmojiUtils'); },
    get PermissionUtils() { return this._getModule('Permissions'); },
    get SortedGuildStore() { return this._getModule('SortedGuildStore'); },
    get PrivateChannelActions() { return this._getModule('PrivateChannelActions'); },
    get GuildMemberStore() { return this._getModule('GuildMemberStore'); },
    get GuildChannelsStore() { return this._getModule('GuildChannelsStore'); },
    get MemberCountStore() { return this._getModule('MemberCountStore'); },
    get GuildActions() { return this._getModule('GuildActions'); },
    get NavigationUtils() { return this._getModule('NavigationUtils'); },
    get GuildPermissions() { return this._getModule('GuildPermissions'); },
    get DiscordConstants() { return this._getModule('DiscordConstants'); },
    get ChannelStore() { return this._getModule('ChannelStore'); },
    get GuildStore() { return this._getModule('GuildStore'); },
    get SelectedGuildStore() { return this._getModule('SelectedGuildStore'); },
    get SelectedChannelStore() { return this._getModule('SelectedChannelStore'); },
    get UserStore() { return this._getModule('UserStore'); },
    get RelationshipStore() { return this._getModule('RelationshipStore'); },
    get RelationshipManager() { return this._getModule('RelationshipManager'); },
    get UserSettingsStore() { return this._getModule('UserSettingsStore'); },
    get UserSettingsWindow() { return this._getModule('UserSettingsWindow'); },

    get DiscordPermissions() { return this.DiscordConstants.Permissions; }
};

export default class DiscordApi {

    /**
     * A list of channels (private and in guilds) the current user is a member of.
     */
    static get channels() {
        const channels = Modules.ChannelStore.getChannels();
        return List.from(channels, c => c.isPrivate() ? new PrivateChannel(c) : new GuildChannel(c));
    }

    /**
     * A list of guilds the current user is a member of.
     */
    static get guilds() {
        const guilds = Modules.GuildStore.getGuilds();
        return List.from(guilds, guild => new Guild(guild));
    }

    /**
     * A list of users.
     */
    static get users() {
        const users = Modules.UserStore.getUsers();
        return List.from(users, user => new User(user));
    }

    /**
     * An object mapping the IDs of guilds the current user is a member of to the number of members that guils has.
     */
    static get memberCounts() {
        return Modules.MemberCountStore.getMemberCounts();
    }

    /**
     * A list of guilds in the order they appear in the server list.
     */
    static get sortedGuilds() {
        const guilds = Modules.SortedGuildStore.getSortedGuilds();
        return List.from(guilds, guild => new Guild(guild));
    }

    static get guildPositions() {
        return Modules.SortedGuildStore.guildPositions;
    }

    /**
     * The currently selected guild.
     */
    static get currentGuild() {
        const guild = Modules.GuildStore.getGuild(Modules.SelectedGuildStore.getGuildId());
        return guild ? new Guild(guild) : undefined;
    }

    /**
     * The currently selected channel.
     */
    static get currentChannel() {
        const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
        return channel ? channel.isPrivate() ? new PrivateChannel(channel) : new GuildChannel(channel) : undefined;
    }

    /**
     * The current user.
     */
    static get currentUser() {
        return Modules.UserStore.getCurrentUser();
    }

    /**
     * A list of the current user's friends.
     */
    static get friends() {
        const friends = Modules.RelationshipStore.getFriendIDs();
        return List.from(friends, id => User.fromId(id));
    }

    get UserPreferences() {
        return UserPreferences;
    }

    static get List() { return List }
    static get User() { return User }
    static get Member() { return Member }
    static get Guild() { return Guild }
    static get Channel() { return Channel }
    static get GuildChannel() { return GuildChannel }
    static get PrivateChannel() { return PrivateChannel }
    static get Message() { return Message }

}

export class UserPreferences {
    /**
     * The user's chosen status. Either "online", "idle", "dnd" or "invisible".
     */
    static get status() { return Modules.UserSettingsStore.status }

    /**
     * The user's selected explicit content filter level.
     * 0 == off, 1 == everyone except friends, 2 == everyone
     * Configurable in the privacy and safety panel.
     */
    static get explicit_content_filter() { return Modules.UserSettingsStore.explicitContentFilter }

    /**
     * Whether to disallow direct messages from server members by default.
     */
    static get default_guilds_restricted() { return Modules.UserSettingsStore.defaultGuildsRestricted }

    /**
     * An array of guilds to disallow direct messages from their members.
     * This is bypassed if the member is has another mutual guild with this disabled, or the member is friends with the current user.
     * Configurable in each server's privacy settings.
     */
    static get restricted_guilds() { return Modules.UserSettingsStore.restrictedGuilds }

    /**
     * An array of flags specifying who should be allowed to add the current user as a friend.
     * If everyone is checked, this will have one item, "any". Otherwise it has either "mutual_friends", "mutual_guilds", both or neither.
     * Configurable in the privacy and safety panel.
     */
    static get friend_source_flags() { return Object.keys(Modules.UserSettingsStore.friendSourceFlags) }

    /**
     * Whether to automatically add accounts from other platforms running on the user's computer.
     * Configurable in the connections panel.
     */
    static get detect_platform_accounts() { return Modules.UserSettingsStore.detectPlatformAccounts }

    /**
     * The number of seconds Discord will wait for activity before sending mobile push notifications.
     * Configurable in the notifications panel.
     */
    static get afk_timeout() { return Modules.UserSettingsStore.afkTimeout }

    /**
     * Whether to display the currently running game as a status message.
     * Configurable in the games panel.
     */
    static get show_current_game() { return Modules.UserSettingsStore.showCurrentGame }

    /**
     * Whether to show images uploaded directly to Discord.
     * Configurable in the text and images panel.
     */
    static get inline_attachment_media() { return Modules.UserSettingsStore.inlineAttachmentMedia }

    /**
     * Whether to show images linked in Discord.
     * Configurable in the text and images panel.
     */
    static get inline_embed_media() { return Modules.UserSettingsStore.inlineEmbedMedia }

    /**
     * Whether to automatically play GIFs when the Discord window is active without having to hover the mouse over the image.
     * Configurable in the text and images panel.
     */
    static get autoplay_gifs() { return Modules.UserSettingsStore.gifAutoPlay }

    /**
     * Whether to show content from HTTP[s] links as embeds.
     * Configurable in the text and images panel.
     */
    static get show_embeds() { return Modules.UserSettingsStore.renderEmbeds }

    /**
     * Whether to show a message's reactions.
     * Configurable in the text and images panel.
     */
    static get show_reactions() { return Modules.UserSettingsStore.renderReactions }

    /**
     * Whether to play animated emoji.
     * Configurable in the text and images panel.
     */
    static get animate_emoji() { return Modules.UserSettingsStore.animateEmoji }

    /**
     * Whether to convert ASCII emoticons to emoji.
     * Configurable in the text and images panel.
     */
    static get convert_emoticons() { return Modules.UserSettingsStore.convertEmoticons }

    /**
     * Whether to allow playing text-to-speech messages.
     * Configurable in the text and images panel.
     */
    static get enable_tts() { return Modules.UserSettingsStore.enableTTSCommand }

    /**
     * The user's selected theme. Either "dark" or "light".
     * Configurable in the appearance panel.
     */
    static get theme() { return Modules.UserSettingsStore.theme }

    /**
     * Whether the user has enabled compact mode.
     * `true` if compact mode is enabled, `false` if cozy mode is enabled.
     * Configurable in the appearance panel.
     */
    static get display_compact() { return Modules.UserSettingsStore.messageDisplayCompact }

    /**
     * Whether to enable developer mode.
     * Currently only adds a "Copy ID" option to the context menu on users, guilds and channels.
     * Configurable in the appearance panel.
     */
    static get developer_mode() { return Modules.UserSettingsStore.developerMode }

    /**
     * The user's selected language code.
     * Configurable in the language panel.
     */
    static get locale() { return Modules.UserSettingsStore.locale }

    /**
     * The user's timezone offset in hours.
     * This is not configurable.
     */
    static get timezone_offset() { return Modules.UserSettingsStore.timezoneOffset }
}
