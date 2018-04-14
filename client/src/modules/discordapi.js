
import { List, InsufficientPermissions } from 'structs';
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
    get UserStatusStore() { return this._getModule('UserStatusStore'); },

    get DiscordPermissions() { return this.DiscordConstants.Permissions; }
};

export default class DiscordApi {

    static get modules() { return Modules }
    static get User() { return User }
    static get Channel() { return Channel }
    static get Guild() { return Guild }
    static get Message() { return Message }

    /**
     * A list of loaded guilds.
     */
    static get guilds() {
        const guilds = Modules.GuildStore.getGuilds();
        return List.from(Object.entries(guilds), ([i, g]) => new Guild(g));
    }

    /**
     * A list of loaded channels.
     */
    static get channels() {
        const channels = Modules.ChannelStore.getChannels();
        return List.from(Object.entries(channels), ([i, c]) => Channel.from(c));
    }

    /**
     * A list of loaded users.
     */
    static get users() {
        const users = Modules.UserStore.getUsers();
        return List.from(Object.entries(users), ([i, u]) => new User(u));
    }

    /**
     * An object mapping guild IDs to their member counts.
     */
    static get memberCounts() {
        return Modules.MemberCountStore.getMemberCounts();
    }

    /**
     * A list of guilds in the order they appear in the server list.
     */
    static get sortedGuilds() {
        const guilds = Modules.SortedGuildStore.getSortedGuilds();
        return List.from(guilds, g => new Guild(g));
    }

    /**
     * An array of guild ID in the order they appear in the server list.
     */
    static get guildPositions() {
        return Modules.SortedGuildStore.guildPositions;
    }

    /**
     * The currently selected guild.
     */
    static get currentGuild() {
        const guild = Modules.GuildStore.getGuild(Modules.SelectedGuildStore.getGuildId());
        if (guild) return new Guild(guild);
    }

    /**
     * The currently selected channel.
     */
    static get currentChannel() {
        const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
        if (channel) return Channel.from(channel);
    }

    /**
     * The current user.
     */
    static get currentUser() {
        const user = Modules.UserStore.getCurrentUser();
        if (user) return new User(user);
    }

    /**
     * A list of the current user's friends.
     */
    static get friends() {
        const friends = Modules.RelationshipStore.getFriendIDs();
        return List.from(friends, id => User.fromId(id));
    }

}
