/**
 * BetterDiscord Discord API Message Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DiscordApi, { Modules } from 'discordapi';

/**
 * A message.
 */
export class Message {

    constructor(data) {
        for (let key in data) this[key] = data[key];
        this.discordObject = data;
    }

    /**
     * Deletes the message.
     */
    delete() {
        Modules.MessageActions.deleteMessage(this.channel_id, this.id);
    }

    /**
     * Edits the content of the message.
     */
    edit(content, parse = false) {
        if (this.author.id !== DiscordApi.currentUser.id) return;
        if (parse) Modules.MessageActions.editMessage(this.channel_id, this.id, Modules.MessageParser.parse(this.discordObject, content));
        else Modules.MessageActions.editMessage(this.channel_id, this.id, {content});
    }

    /**
     * Starts the editing mode of the UI.
     */
    startEdit() {
        if (this.author.id !== DiscordApi.currentUser.id) return;
        Modules.MessageActions.startEditMessage(this.channel_id, this.id, this.content);
    }

    /**
     * End the editing mode of the UI.
     */
    endEdit() {
        Modules.MessageActions.endEditMessage();
    }

    /**
     * Jumps to this message.
     */
    jumpTo(flash = true) {
        Modules.MessageActions.jumpToMessage(this.channel_id, this.id, flash);
    }

}
