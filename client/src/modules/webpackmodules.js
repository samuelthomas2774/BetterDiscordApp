/**
 * BetterDiscord WebpackModules Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export class Filters {
    static byProperties(props, selector = m => m) {
        return module => {
            const component = selector(module);
            if (!component) return false;
            return props.every(property => component[property] !== undefined);
        };
    }

    static byPrototypeFields(fields, selector = m => m) {
        return module => {
            const component = selector(module);
            if (!component) return false;
            if (!component.prototype) return false;
            return fields.every(field => component.prototype[field] !== undefined);
        };
    }

    static byCode(search, selector = m => m) {
        return module => {
            const method = selector(module);
            if (!method) return false;
            return method.toString().search(search) !== -1;
        };
    }

    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    static combine(...filters) {
        return module => {
            return filters.every(filter => filter(module));
        };
    }
}

const KnownModules = {
    React: Filters.byProperties(['createElement', 'cloneElement']),
    ReactDOM: Filters.byProperties(['render', 'findDOMNode']),

    Events: Filters.byPrototypeFields(['setMaxListeners', 'emit']),

    /* Guild Info, Stores, and Utilities */
    GuildStore: Filters.byProperties(['getGuild']),
    SortedGuildStore: Filters.byProperties(['getSortedGuilds']),
    SelectedGuildStore: Filters.byProperties(['getLastSelectedGuildId']),
    GuildSync: Filters.byProperties(["getSyncedGuilds"]),
    GuildInfo: Filters.byProperties(["getAcronym"]),
    GuildChannelsStore: Filters.byProperties(['getChannels', 'getDefaultChannel']),
    GuildMemberStore: Filters.byProperties(['getMember']),
    MemberCountStore: Filters.byProperties(["getMemberCounts"]),
    GuildEmojiStore: Filters.byProperties(['getEmojis']),
    GuildActions: Filters.byProperties(['markGuildAsRead']),
    GuildPermissions: Filters.byProperties(['getGuildPermissions']),

    /* Channel Store & Actions */
    ChannelStore: Filters.byProperties(['getChannels', 'getDMFromUserId']),
    SelectedChannelStore: Filters.byProperties(['getLastSelectedChannelId']),
    ChannelActions: Filters.byProperties(["selectChannel"]),
    PrivateChannelActions: Filters.byProperties(["openPrivateChannel"]),
    ChannelSelector: Filters.byProperties(["selectGuild", "selectChannel"]),

    /* Current User Info, State and Settings */
    UserInfoStore: Filters.byProperties(["getToken"]),
    UserSettingsStore: Filters.byProperties(["guildPositions"]),
    AccountManager: Filters.byProperties(['register', 'login']),
    UserSettingsUpdater: Filters.byProperties(['updateRemoteSettings']),
    OnlineWatcher: Filters.byProperties(['isOnline']),
    CurrentUserIdle: Filters.byProperties(['getIdleTime']),
    RelationshipStore: Filters.byProperties(['isBlocked']),
    RelationshipManager: Filters.byProperties(['addRelationship']),
    MentionStore: Filters.byProperties(["getMentions"]),

    /* User Stores and Utils */
    UserStore: Filters.byProperties(['getCurrentUser']),
    UserStatusStore: Filters.byProperties(['getStatuses']),
    UserTypingStore: Filters.byProperties(['isTyping']),
    UserActivityStore: Filters.byProperties(['getActivity']),
    UserNameResolver: Filters.byProperties(['getName']),

    /* Emoji Store and Utils */
    EmojiInfo: Filters.byProperties(['isEmojiDisabled']),
    EmojiUtils: Filters.byProperties(['getGuildEmoji']),
    EmojiStore: Filters.byProperties(['getByCategory', 'EMOJI_NAME_RE']),

    /* Invite Store and Utils */
    InviteStore: Filters.byProperties(["getInvites"]),
    InviteResolver: Filters.byProperties(['findInvite']),
    InviteActions: Filters.byProperties(['acceptInvite']),

    /* Discord Objects & Utils */
    DiscordConstants: Filters.byProperties(["Permissions", "ActivityTypes", "StatusTypes"]),
    Permissions: Filters.byProperties(['getHighestRole']),
    ColorConverter: Filters.byProperties(['hex2int']),
    ColorShader: Filters.byProperties(['darken']),
    ClassResolver: Filters.byProperties(["getClass"]),
    ButtonData: Filters.byProperties(["ButtonSizes"]),
    IconNames: Filters.byProperties(["IconNames"]),
    NavigationUtils: Filters.byProperties(['transitionTo', 'replaceWith', 'getHistory']),

    /* Discord Messages */
    MessageStore: Filters.byProperties(['getMessages']),
    MessageActions: Filters.byProperties(['jumpToMessage', '_sendMessage']),
    MessageQueue: Filters.byProperties(['enqueue']),
    MessageParser: Filters.byProperties(['createMessage', 'parse', 'unparse']),

    /* In-Game Overlay */
    OverlayUserPopoutSettings: Filters.byProperties(['openUserPopout']),
    OverlayUserPopoutInfo: Filters.byProperties(['getOpenedUserPopout']),

    /* Experiments */
    ExperimentStore: Filters.byProperties(['getExperimentOverrides']),
    ExperimentsManager: Filters.byProperties(['isDeveloper']),
    CurrentExperiment: Filters.byProperties(['getExperimentId']),

    /* Images, Avatars and Utils */
    ImageResolver: Filters.byProperties(["getUserAvatarURL"]),
    ImageUtils: Filters.byProperties(['getSizedImageSrc']),
    AvatarDefaults: Filters.byProperties(["getUserAvatarURL", "DEFAULT_AVATARS"]),

    /* Drag & Drop */
    DNDActions: Filters.byProperties(["beginDrag"]),
    DNDSources: Filters.byProperties(["addTarget"]),
    DNDObjects: Filters.byProperties(["DragSource"]),

    /* Electron & Other Internals with Utils*/
    ElectronModule: Filters.byProperties(["_getMainWindow"]),
    Dispatcher: Filters.byProperties(['dirtyDispatch']),
    PathUtils: Filters.byProperties(["hasBasename"]),
    NotificationModule: Filters.byProperties(["showNotification"]),
    RouterModule: Filters.byProperties(["Router"]),
    APIModule: Filters.byProperties(["getAPIBaseURL"]),
    AnalyticEvents: Filters.byProperties(["AnalyticEventConfigs"]),
    KeyGenerator: Filters.byCode(/"binary"/),
    Buffers: Filters.byProperties(['Buffer', 'kMaxLength']),
    DeviceStore: Filters.byProperties(['getDevices']),
    SoftwareInfo: Filters.byProperties(["os"]),
    CurrentContext: Filters.byProperties(["setTagsContext"]),

    /* Media Stuff (Audio/Video) */
    MediaDeviceInfo: Filters.byProperties(["Codecs", "SUPPORTED_BROWSERS"]),
    MediaInfo: Filters.byProperties(["getOutputVolume"]),
    MediaEngineInfo: Filters.byProperties(['MediaEngineFeatures']),
    VoiceInfo: Filters.byProperties(["EchoCancellation"]),
    VideoStream: Filters.byProperties(["getVideoStream"]),
    SoundModule: Filters.byProperties(["playSound"]),

    /* Window, DOM, HTML */
    WindowInfo: Filters.byProperties(['isFocused', 'windowSize']),
    TagInfo: Filters.byProperties(['VALID_TAG_NAMES']),
    DOMInfo: Filters.byProperties(['canUseDOM']),
    HTMLUtils: Filters.byProperties(['htmlFor', 'sanitizeUrl']),

    /* Locale/Location and Time */
    LocaleManager: Filters.byProperties(['setLocale']),
    Moment: Filters.byProperties(['parseZone']),
    LocationManager: Filters.byProperties(["createLocation"]),
    Timestamps: Filters.byProperties(["fromTimestamp"]),

    /* Strings and Utils */
    Strings: Filters.byProperties(["TEXT", "TEXTAREA_PLACEHOLDER"]),
    StringFormats: Filters.byProperties(['a', 'z']),
    StringUtils: Filters.byProperties(["toASCII"]),

    /* URLs and Utils */
    URLParser: Filters.byProperties(['Url', 'parse']),
    ExtraURLs: Filters.byProperties(['getArticleURL']),

    /* DOM/React Components */
    /* ==================== */
    UserSettingsWindow: Filters.byProperties(['open', 'updateAccount']),
    LayerManager: Filters.byProperties(['popLayer', 'pushLayer']),

    /* Modals */
    ModalStack: Filters.byProperties(['push', 'update', 'pop', 'popWithKey']),
    UserProfileModals: Filters.byProperties(['fetchMutualFriends', 'setSection']),
    ConfirmModal: Filters.byPrototypeFields(['handleCancel', 'handleSubmit', 'handleMinorConfirm']),

    /* Popouts */
    PopoutStack: Filters.byProperties(['open', 'close', 'closeAll']),
    PopoutOpener: Filters.byProperties(['openPopout']),
    EmojiPicker: Filters.byPrototypeFields(['onHoverEmoji', 'selectEmoji']),

    /* Context Menus */
    ContextMenuActions: Filters.byCode(/CONTEXT_MENU_CLOSE/, c => c.close),
    ContextMenuItemsGroup: Filters.byCode(/itemGroup/),
    ContextMenuItem: Filters.byCode(/\.label\b.*\.hint\b.*\.action\b/),

    /* In-Message Links */
    ExternalLink: Filters.byCode(/\.trusted\b/)
};

export class WebpackModules {

    /**
     * Finds a module using a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getModule(filter, first = true) {
        const modules = this.getAllModules();
        const rm = [];
        for (let index in modules) {
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const { exports } = module;
            let foundModule = null;

            if (!exports) continue;
            if (exports.__esModule && exports.default && filter(exports.default)) foundModule = exports.default;
            if (filter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
        }
        return first || rm.length == 0 ? undefined : rm;
    }

    /**
     * Finds a module by it's name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    static getModuleByName(name, fallback) {
        if (Cache.hasOwnProperty(name)) return Cache[name];
        if (KnownModules.hasOwnProperty(name)) fallback = KnownModules[name];
        if (!fallback) return undefined;
        const module = this.getModule(fallback, true);
        return module ? Cache[name] = module : undefined;
    }

    /**
     * Finds a module by it's display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static getModuleByDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }

    /**
     * Finds a module using it's code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static getModuleByRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }

    /**
     * Finds a module using properties on it's prototype.
     * @param {Array} props Properties to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getModuleByPrototypes(prototypes, first = true) {
        return this.getModule(Filters.byPrototypeFields(prototypes), first);
    }

    /**
     * Finds a module using it's own properties.
     * @param {Array} props Properties to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getModuleByProps(props, first = true) {
        return this.getModule(Filters.byProperties(props), first);
    }

    /**
     * Discord's __webpack_require__ function.
     */
    static get require() {
        if (this._require) return this._require;
        const id = 'bd-webpackmodules';
        const __webpack_require__ = window['webpackJsonp']([], {
            [id]: (module, exports, __webpack_require__) => exports.default = __webpack_require__
        }, [id]).default;
        delete __webpack_require__.m[id];
        delete __webpack_require__.c[id];
        return this._require = __webpack_require__;
    }

    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules() {
        return this.require.c;
    }

    /**
     * Returns an array of known modules.
     * @return {Array}
     */
    static listKnownModules() {
        return Object.keys(KnownModules);
    }

}
