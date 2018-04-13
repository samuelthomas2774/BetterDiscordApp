
import { DiscordApi, DiscordApiModules as Modules } from 'modules';
import { Channel } from './channel';
import { User } from './user';

export class Message {

    constructor(data) {
        this.discordObject = data;
    }

    get id() { return this.discordObject.id }
    get channel_id() { return this.discordObject.channel_id }
    get webhook_id() { return this.discordObject.webhookId }
    get nonce() { return this.discordObject.nonce }
    get type() { return this.discordObject.type }
    get content() { return this.discordObject.content }
    get content_parsed() { return this.discordObject.contentParsed }
    get invite_codes() { return this.discordObject.invites }
    get embeds() { return this.discordObject.embeds }
    get attachments() { return this.discordObject.attachments }
    get mentions() { return this.discordObject.mentions }
    get mention_roles() { return this.discordObject.mentionRoles }
    get mention_everyone() { return this.discordObject.mentionEveryone }
    get reactions() { return this.discordObject.reactions }
    get timestamp() { return this.discordObject.timestamp }
    get edited_timestamp() { return this.discordObject.editedTimestamp }
    get state() { return this.discordObject.state }
    get tts() { return this.discordObject.tts }
    get mentioned() { return this.discordObject.mentioned }
    get bot() { return this.discordObject.bot }
    get blocked() { return this.discordObject.blocked }
    get pinned() { return this.discordObject.pinned }
    get nick() { return this.discordObject.nick }
    get colour_string() { return this.discordObject.colorString }
    get application() { return this.discordObject.application }
    get activity() { return this.discordObject.activity }
    get call() { return this.discordObject.call }

    get author() {
        if (this.discordObject.author)
            return new User(this.discordObject.author);
    }

    get channel() {
        return Channel.fromId(this.channel_id);
    }

    get guild() {
        if (this.channel) return this.channel.guild;
    }

    get edited() {
        return !!this.edited_timestamp;
    }

    /**
     * Programmatically update the message's content.
     * TODO: how do we know if the message was updated successfully?
     * @param {String} content The message's new content
     * @param {Boolean} parse Whether to parse the message or update it as it is
     */
    edit(content, parse = false) {
        if (this.author.id !== DiscordApi.currentUser.id)
            throw new Error('Cannot edit messages sent by other users.');
        if (parse) Modules.MessageActions.editMessage(this.channel_id, this.id, Modules.MessageParser.parse(this.discordObject, content));
        else Modules.MessageActions.editMessage(this.channel_id, this.id, {content});
    }

    /**
     * Start the edit mode of the UI.
     */
    startEdit() {
        if (this.author.id !== DiscordApi.currentUser.id)
            throw new Error('Cannot edit messages sent by other users.');
        Modules.MessageActions.startEditMessage(this.channel_id, this.id, this.content);
    }

    /**
     * Exit the edit mode of the UI.
     */
    endEdit() {
        Modules.MessageActions.endEditMessage();
    }

    /**
     * Deletes the message.
     * TODO: how do we know if the message was deleted successfully?
     */
    delete() {
        Modules.MessageActions.deleteMessage(this.channel_id, this.id);
    }

    /**
     * Jumps to the message.
     */
    jumpTo(flash = true) {
        Modules.MessageActions.jumpToMessage(this.channel_id, this.id, flash);
    }

}
