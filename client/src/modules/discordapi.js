/**
 * BetterDiscord Discord API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { List } from 'structs';
import { User, Channel, Guild, Message } from 'discordstructs';
import { WebpackModules } from './webpackmodules';

export const Modules = {
    _getModule(name) {
        const foundModule = WebpackModules.getModuleByName(name);
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
    get ChangeNicknameModal() { return this._getModule('ChangeNicknameModal'); },
    get UserSettingsStore() { return this._getModule('UserSettingsStore'); },
    get UserSettingsWindow() { return this._getModule('UserSettingsWindow'); },
    get UserStatusStore() { return this._getModule('UserStatusStore'); },
    get ChannelSettingsWindow() { return this._getModule('ChannelSettingsWindow'); },
    get GuildSettingsWindow() { return this._getModule('GuildSettingsWindow'); },
    get CreateChannelModal() { return this._getModule('CreateChannelModal'); },
    get PruneMembersModal() { return this._getModule('PruneMembersModal'); },
    get NotificationSettingsModal() { return this._getModule('NotificationSettingsModal'); },
    get PrivacySettingsModal() { return this._getModule('PrivacySettingsModal'); },
    get UserProfileModal() { return this._getModule('UserProfileModal'); },
    get APIModule() { return this._getModule('APIModule'); },
    get UserNoteStore() { return this._getModule('UserNoteStore'); },

    get DiscordPermissions() { return this.DiscordConstants.Permissions; }
};

export default class DiscordApi {

    static get modules() { return Modules }
    static get User() { return User }
    static get Channel() { return Channel }
    static get Guild() { return Guild }
    static get Message() { return Message }

    /**
     * @returns {List} A list of loaded guilds.
     */
    static get guilds() {
        const guilds = Modules.GuildStore.getGuilds();
        return List.from(Object.entries(guilds), ([i, g]) => Guild.from(g));
    }

    /**
     * @returns {List} A list of loaded channels.
     */
    static get channels() {
        const channels = Modules.ChannelStore.getChannels();
        return List.from(Object.entries(channels), ([i, c]) => Channel.from(c));
    }

    /**
     * @returns {List} A list of loaded users.
     */
    static get users() {
        const users = Modules.UserStore.getUsers();
        return List.from(Object.entries(users), ([i, u]) => User.from(u));
    }

    /**
     * @returns {Object} An object mapping guild IDs to their member counts.
     */
    static get memberCounts() {
        return Modules.MemberCountStore.getMemberCounts();
    }

    /**
     * @returns {List} A list of guilds in the order they appear in the server list.
     */
    static get sortedGuilds() {
        const guilds = Modules.SortedGuildStore.getSortedGuilds();
        return List.from(guilds, g => Guild.from(g));
    }

    /**
     * @returns {Array} An array of guild IDs in the order they appear in the server list.
     */
    static get guildPositions() {
        return Modules.SortedGuildStore.guildPositions;
    }

    /**
     * @returns {Guild} The currently selected guild.
     */
    static get currentGuild() {
        const guild = Modules.GuildStore.getGuild(Modules.SelectedGuildStore.getGuildId());
        if (guild) return Guild.from(guild);
    }

    /**
     * @returns {Channel} The currently selected channel.
     */
    static get currentChannel() {
        const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
        if (channel) return Channel.from(channel);
    }

    /**
     * @returns {User} The current user.
     */
    static get currentUser() {
        const user = Modules.UserStore.getCurrentUser();
        if (user) return User.from(user);
    }

    /**
     * @returns {List} A list of the current user's friends.
     */
    static get friends() {
        const friends = Modules.RelationshipStore.getFriendIDs();
        return List.from(friends, id => User.fromId(id));
    }

    static get UserSettings() {
        return UserSettings;
    }

}

export class UserSettings {
    /**
     * Opens Discord's settings UI.
     */
    static open(section = 'ACCOUNT') {
        Modules.UserSettingsWindow.setSection(section);
        Modules.UserSettingsWindow.open();
    }

    /**
     * @returns {String} The user's current status. Either "online", "idle", "dnd" or "invisible".
     */
    static get status() { return Modules.UserSettingsStore.status }

    /**
     * The user's selected explicit content filter level.
     * Configurable in the privacy and safety panel.
     *  @returns {Number} 0 == off, 1 == everyone except friends, 2 == everyone
     */
    static get explicitContentFilter() { return Modules.UserSettingsStore.explicitContentFilter }

    /**
     * @returns {Boolean} Whether to disallow direct messages from server members by default.
     */
    static get defaultGuildsRestricted() { return Modules.UserSettingsStore.defaultGuildsRestricted }

    /**
     * This is bypassed if the member is has another mutual guild with this disabled, or the member is friends with the current user.
     * Configurable in each server's privacy settings.
     * @returns {Array} An array of guilds to disallow direct messages from their members.
     */
    static get restrictedGuildIds() { return Modules.UserSettingsStore.restrictedGuilds }

    /**
     * @returns {List} List of restricted guilds
     */
    static get restrictedGuilds() {
        return List.from(this.restrictedGuildIds, id => Guild.fromId(id) || id);
    }

    /**
     * If everyone is checked, this will only have one item, "all". Otherwise it has either "mutual_friends", "mutual_guilds", both or neither.
     * Configurable in the privacy and safety panel.
     * @returns {Array} An array of flags specifying who should be allowed to add the current user as a friend.
     */
    static get friendSourceFlags() { return Object.keys(Modules.UserSettingsStore.friendSourceFlags) }
    static get friendSourceEveryone() { return this.friendSourceFlags.include('all') }
    static get friendSourceMutual_friends() { return this.friendSourceFlags.include('all') || this.friendSourceFlags.include('mutual_friends') }
    static get friendSourceMutual_guilds() { return this.friendSourceFlags.include('all') || this.friendSourceFlags.include('mutual_guilds') }
    static get friendSourceAnyone() { return this.friendSourceFlags.length > 0 }

    /**
     * Configurable in the connections panel.
     * @returns {Boolean} Whether to automatically add accounts from other platforms running on the user's computer.
     */
    static get detectPlatformAccounts() { return Modules.UserSettingsStore.detectPlatformAccounts }

    /**
     * Configurable in the notifications panel.
     * @returns {Number} The number of seconds Discord will wait for activity before sending mobile push notifications.
     */
    static get afkTimeout() { return Modules.UserSettingsStore.afkTimeout }

    /**
     * Configurable in the games panel.
     * @returns {Boolean} Whether to display the currently running game as a status message.
     */
    static get showCurrentGame() { return Modules.UserSettingsStore.showCurrentGame }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to show images uploaded directly to Discord.
     */
    static get inlineAttachmentMedia() { return Modules.UserSettingsStore.inlineAttachmentMedia }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to show images linked in Discord.
     */
    static get inlineEmbedMedia() { return Modules.UserSettingsStore.inlineEmbedMedia }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to automatically play GIFs when the Discord window is active without having to hover the mouse over the image.
     */
    static get autoplayGifs() { return Modules.UserSettingsStore.gifAutoPlay }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to show content from HTTP[s] links as embeds.
     */
    static get showEmbeds() { return Modules.UserSettingsStore.renderEmbeds }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to show a message's reactions.
     */
    static get showReactions() { return Modules.UserSettingsStore.renderReactions }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to play animated emoji.
     */
    static get animateEmoji() { return Modules.UserSettingsStore.animateEmoji }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to convert ASCII emoticons to emoji.
     */
    static get convertEmoticons() { return Modules.UserSettingsStore.convertEmoticons }

    /**
     * Configurable in the text and images panel.
     * @returns {Boolean} Whether to allow playing text-to-speech messages.
     */
    static get allowTts() { return Modules.UserSettingsStore.enableTTSCommand }

    /**
     * Configurable in the appearance panel.
     * @returns {String} The user's selected theme. Either "dark" or "light".
     */
    static get theme() { return Modules.UserSettingsStore.theme }

    /**
     * Configurable in the appearance panel.
     * @returns {Boolean} Whether the user has enabled compact mode. `true` if compact mode is enabled, `false` if cozy mode is enabled.
     */
    static get displayCompact() { return Modules.UserSettingsStore.messageDisplayCompact }

    /**
     * Currently only adds a "Copy ID" option to the context menu on users, guilds and channels.
     * Configurable in the appearance panel.
     * @returns {Boolean} Whether the user has enabled developer mode.
     */
    static get developerMode() { return Modules.UserSettingsStore.developerMode }

    /**
     * Configurable in the language panel.
     * @returns {String} The user's selected language code.
     */
    static get locale() { return Modules.UserSettingsStore.locale }

    /**
     * This is not configurable.
     * @returns {Number} The user's timezone offset in hours.
     */
    static get timezoneOffset() { return Modules.UserSettingsStore.timezoneOffset }
}
