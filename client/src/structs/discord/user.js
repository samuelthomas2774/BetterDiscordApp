
import { DiscordApi, DiscordApiModules as Modules } from 'modules';
import { List, InsufficientPermissions } from 'structs';
import { Guild } from './guild';
import { PrivateChannel } from './channel';

const users = new WeakMap();

export class User {

    constructor(data, _wm) {
        if (!_wm) _wm = users;
        if (_wm.has(data)) return _wm.get(data);
        _wm.set(data, this);

        this.discordObject = data;
    }

    static fromId(id) {
        const user = Modules.UserStore.getUser(id);
        if (user) return new User(user);
    }

    get id() { return this.discordObject.id }
    get username() { return this.discordObject.username }
    get username_lower_case() { return this.discordObject.usernameLowerCase }
    get discriminator() { return this.discordObject.discriminator }
    get avatar() { return this.discordObject.avatar }
    get email() { return undefined }
    get phone() { return undefined }
    get flags() { return this.discordObject.flags }
    get bot() { return this.discordObject.bot }
    get premium() { return this.discordObject.premium }
    get verified() { return this.discordObject.verified }
    get mfa_enabled() { return this.discordObject.mfaEnabled }
    get mobile() { return this.discordObject.mobile }

    get tag() { return this.discordObject.tag }
    get avatar_url() { return this.discordObject.avatarURL }
    get created_at() { return this.discordObject.createdAt }

    get is_clamied() { return this.discordObject.isClaimed() }
    get is_local_bot() { return this.discordObject.isLocalBot() }
    get is_phone_verified() { return this.discordObject.isPhoneVerified() }

    get guilds() {
        return DiscordApi.guilds.filter(g => g.members.find(m => m.id === this.id));
    }

    get status() {
        return Modules.UserStatusStore.getStatus(this.id);
    }

    get activity() {
        // type can be either 0 (normal/rich presence game), 1 (streaming) or 2 (listening to Spotify)
        // (3 appears as watching but is undocumented)
        return Modules.UserStatusStore.getActivity(this.id);
    }

    get direct_messages() {
        return DiscordApi.channels.find(c => c.type === 'DM' && c.recipient_id === this.id);
    }

    async ensurePrivateChannel() {
        if (DiscordApi.currentUser.id === this.id)
            throw new Error('Cannot create a direct message channel to the current user.');
        return Channel.from(await Modules.PrivateChannelActions.ensurePrivateChannel(DiscordApi.currentUser.id, this.id));
    }

    async sendMessage(content, parse = true) {
        const channel = await this.ensurePrivateChannel();
        return channel.sendMessage(content, parse);
    }

    get is_friend() {
        return Modules.RelationshipStore.isFriend(this.id);
    }

    get is_blocked() {
        return Modules.RelationshipStore.isBlocked(this.id);
    }

    addFriend() {
        Modules.RelationshipManager.addRelationship(this.id, {location: 'Context Menu'});
    }

    removeFriend() {
        Modules.RelationshipManager.removeRelationship(this.id, {location: 'Context Menu'});
    }

    block() {
        Modules.RelationshipManager.addRelationship(this.id, {location: 'Context Menu'}, Modules.DiscordConstants.RelationshipTypes.BLOCKED);
    }

    unblock() {
        Modules.RelationshipManager.removeRelationship(this.id, {location: 'Context Menu'});
    }

}

const guild_members = new WeakMap();

// TODO: don't extend User
export class GuildMember extends User {
    constructor(data, guild_id) {
        const user = Modules.UserStore.getUser(data.userId);
        super(user, guild_members);

        this.member_data = data;
        this.guild_id = guild_id;
    }

    get nickname() { return this.member_data.nick }
    get colour_string() { return this.member_data.colorString }
    get hoist_role_id() { return this.member_data.hoistRoleId }
    get role_ids() { return this.member_data.roles }

    get user() {
        return User.fromId(this.id);
    }

    get guild() {
        return Guild.fromId(this.guild_id);
    }

    get roles() {
        return List.from(this.member_data.roles, id => this.guild.roles.find(r => r.id === id))
            .sort((r1, r2) => r1.position === r2.position ? 0 : r1.position > r2.position ? 1 : -1);
    }

    get hoist_role() {
        return this.guild.roles.find(r => r.id === this.hoist_role_id);
    }

    checkPermissions(perms) {
        return Modules.PermissionUtils.can(perms, DiscordApi.currentUser, Modules.GuildStore.getGuild(this.guild_id));
    }

    assertPermissions(name, perms) {
        if (!this.checkPermissions(perms))
            throw new InsufficientPermissions(name);
    }

    /**
     * Kicks this user from the guild.
     * @param {String} reason A reason to attach to the audit log entry
     * @return {Promise}
     */
    kick(reason = '') {
        this.assertPermissions('KICK_MEMBERS', Modules.DiscordPermissions.KICK_MEMBERS);
        return Modules.GuildActions.kickUser(this.guild_id, this.id, reason);
    }

    /**
     * Bans this user from the guild.
     * @param {Number} daysToDelete The number of days of the user's recent message history to delete
     * @param {String} reason A reason to attach to the audit log entry
     * @return {Promise}
     */
    ban(daysToDelete = 1, reason = '') {
        this.assertPermissions('BAN_MEMBERS', Modules.DiscordPermissions.BAN_MEMBERS);
        return Modules.GuildActions.banUser(this.guild_id, this.id, daysToDelete, reason);
    }

    /**
     * Removes the ban for this user.
     * @return {Promise}
     */
    unban() {
        this.assertPermissions('BAN_MEMBERS', Modules.DiscordPermissions.BAN_MEMBERS);
        return Modules.GuildActions.unbanUser(this.guild_id, this.id);
    }

    /**
     * Moves this user to another voice channel.
     * @param {GuildVoiceChannel} channel The channel to move this user to
     */
    move(channel) {
        this.assertPermissions('MOVE_MEMBERS', Modules.DiscordPermissions.MOVE_MEMBERS);
        Modules.GuildActions.setChannel(this.guild_id, this.id, channel.id);
    }

    /**
     * Mutes this user for everyone in the guild.
     */
    mute(active = true) {
        this.assertPermissions('MUTE_MEMBERS', Modules.DiscordPermissions.MUTE_MEMBERS);
        Modules.GuildActions.setServerMute(this.guild_id, this.id, active);
    }

    /**
     * Unmutes this user.
     */
    unmute() {
        this.mute(false);
    }

    /**
     * Deafens this user.
     */
    deafen(active = true) {
        this.assertPermissions('DEAFEN_MEMBERS', Modules.DiscordPermissions.DEAFEN_MEMBERS);
        Modules.GuildActions.setServerDeaf(this.guild_id, this.id, active);
    }

    /**
     * Undeafens this user.
     */
    undeafen() {
        this.deafen(false);
    }
}
