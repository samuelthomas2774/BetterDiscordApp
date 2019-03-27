/**
 * BetterDiscord Discord API
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordApi, { Modules } from '.';
import EventEmitter from 'events';
import { Utils } from 'common';
import { List } from 'structs';
import { User, Channel, Guild, Message } from 'discordstructs';

export default new class UserSettings {

    /**
     * Opens Discord's settings UI.
     */
    open(section = 'ACCOUNT') {
        Modules.UserSettingsWindow.open();
        Modules.UserSettingsWindow.setSection(section);
    }

    /**
     * The user's current status. Either "online", "idle", "dnd" or "invisible".
     * @type {string}
     */
    get status() { return Modules.UserSettingsStore.status }

    /**
     * The user's selected explicit content filter level.
     * 0 == off, 1 == everyone except friends, 2 == everyone
     * Configurable in the privacy and safety panel.
     * @type {number}
     */
    get explicitContentFilter() { return Modules.UserSettingsStore.explicitContentFilter }

    /**
     * Whether to disallow direct messages from server members by default.
     * @type {boolean}
     */
    get defaultGuildsRestricted() { return Modules.UserSettingsStore.defaultGuildsRestricted }

    /**
     * An array of guilds to disallow direct messages from their members.
     * This is bypassed if the member is has another mutual guild with this disabled, or the member is friends with the current user.
     * Configurable in each server's privacy settings.
     * @type {Guild[]}
     */
    get restrictedGuilds() {
        return List.from(this.restrictedGuildIds, id => Guild.fromId(id) || id);
    }

    get restrictedGuildIds() { return Modules.UserSettingsStore.restrictedGuilds }

    /**
     * An array of flags specifying who should be allowed to add the current user as a friend.
     * If everyone is checked, this will only have one item, "all". Otherwise it has either "mutual_friends", "mutual_guilds", both or neither.
     * Configurable in the privacy and safety panel.
     * @type {string[]}
     */
    get friendSourceFlags() { return Object.keys(Modules.UserSettingsStore.friendSourceFlags).filter(f => Modules.UserSettingsStore.friendSourceFlags[f]) }
    get friendSourceEveryone() { return this.friendSourceFlags.includes('all') }
    get friendSourceMutualFriends() { return this.friendSourceFlags.includes('all') || this.friendSourceFlags.includes('mutual_friends') }
    get friendSourceMutualGuilds() { return this.friendSourceFlags.includes('all') || this.friendSourceFlags.includes('mutual_guilds') }
    get friendSourceAnyone() { return this.friendSourceFlags.length > 0 }

    /**
     * Whether to automatically add accounts from other platforms running on the user's computer.
     * Configurable in the connections panel.
     * @type {boolean}
     */
    get detectPlatformAccounts() { return Modules.UserSettingsStore.detectPlatformAccounts }

    /**
     * The number of seconds Discord will wait for activity before sending mobile push notifications.
     * Configurable in the notifications panel.
     * @type {number}
     */
    get afkTimeout() { return Modules.UserSettingsStore.afkTimeout }

    /**
     * Whether to display the currently running game as a status message.
     * Configurable in the games panel.
     * @type {boolean}
     */
    get showCurrentGame() { return Modules.UserSettingsStore.showCurrentGame }

    /**
     * Whether to show images uploaded directly to Discord.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get inlineAttachmentMedia() { return Modules.UserSettingsStore.inlineAttachmentMedia }

    /**
     * Whether to show images linked in Discord.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get inlineEmbedMedia() { return Modules.UserSettingsStore.inlineEmbedMedia }

    /**
     * Whether to automatically play GIFs when the Discord window is active without having to hover the mouse over the image.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get autoplayGifs() { return Modules.UserSettingsStore.gifAutoPlay }

    /**
     * Whether to show content from HTTP[s] links as embeds.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get showEmbeds() { return Modules.UserSettingsStore.renderEmbeds }

    /**
     * Whether to show a message's reactions.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get showReactions() { return Modules.UserSettingsStore.renderReactions }

    /**
     * When to show spoilers.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get showSpoilers() { return Modules.UserSettingsStore.renderSpoilers }

    /**
     * Whether to play animated emoji.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get animateEmoji() { return Modules.UserSettingsStore.animateEmoji }

    /**
     * Whether to convert ASCII emoticons to emoji.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get convertEmoticons() { return Modules.UserSettingsStore.convertEmoticons }

    /**
     * Whether to allow playing text-to-speech messages.
     * Configurable in the text and images panel.
     * @type {boolean}
     */
    get allowTts() { return Modules.UserSettingsStore.enableTTSCommand }

    /**
     * The user's selected theme. Either "dark" or "light".
     * Configurable in the appearance panel.
     * @type {string}
     */
    get theme() { return Modules.UserSettingsStore.theme }

    /**
     * Whether the user has enabled compact mode.
     * `true` if compact mode is enabled, `false` if cozy mode is enabled.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get displayCompact() { return Modules.UserSettingsStore.messageDisplayCompact }

    /**
     * Whether the user has enabled colourblind mode.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get colourblindMode() { return Modules.AccessibilityStore.colorblindMode }

    /**
     * Whether the user has enabled the activity tab.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get showActivityTab() { return !Modules.UserSettingsStore.disableGamesTab }

    /**
     * Whether the user has enabled developer mode.
     * Currently only adds a "Copy ID" option to the context menu on users, guilds and channels.
     * Configurable in the appearance panel.
     * @type {boolean}
     */
    get developerMode() { return Modules.UserSettingsStore.developerMode }

    /**
     * The user's selected language code.
     * Configurable in the language panel.
     * @type {string}
     */
    get locale() { return Modules.UserSettingsStore.locale }

    /**
     * The user's timezone offset in hours.
     * This is not configurable.
     * @type {number}
     */
    get timezoneOffset() { return Modules.UserSettingsStore.timezoneOffset }

}
