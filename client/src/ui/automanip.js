/**
 * BetterDiscord Automated DOM Manipulations
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events, WebpackModules } from 'modules';
import Reflection from './reflection';
import DOM from './dom';

class TempApi {
    static get currentGuildId() {
        try {
            return WebpackModules.getModuleByName('SelectedGuildStore').getGuildId();
        } catch (err) {
            return 0;
        }
    }
    static get currentChannelId() {
        try {
            return WebpackModules.getModuleByName('SelectedChannelStore').getChannelId();
        } catch (err) {
            return 0;
        }
    }
    static get currentUserId() {
        try {
            return WebpackModules.getModuleByName('UserStore').getCurrentUser().id;
        } catch (err) {
            return 0;
        }
    }
}

export default class {

    constructor() {
        Events.on('server-switch', e => {
            try {
                this.appMount.setAttribute('guild-id', TempApi.currentGuildId);
                this.appMount.setAttribute('channel-id', TempApi.currentChannelId);
                this.setIds();
            } catch (err) {
                console.log(err);
            }
        });
        Events.on('channel-switch', e => {
            try {
                this.appMount.setAttribute('guild-id', TempApi.currentGuildId);
                this.appMount.setAttribute('channel-id', TempApi.currentChannelId);
                this.setIds();
            } catch (err) {
                console.log(err);
            }
        });
    }

    setIds() {
        for (let msg of document.querySelectorAll('.message')) {
            if (msg.hasAttribute('message-id')) continue;
            const message = Reflection.findProp(msg, 'message');
            if (!message) continue;
            const { id, author } = message;
            if (!id || !author) continue;
            const currentUser = author.id === TempApi.currentUserId;
            DOM.setAttributes(msg, [{ name: 'message-id', value: message.id }]);
            const msgGroup = msg.closest('.message-group');
            if (!msgGroup) continue;
            DOM.setAttributes(msgGroup, [{ name: 'author-id', value: author.id }, { name: 'author-is-currentuser', value: currentUser }]);
        }
    }

    get appMount() {
        return document.getElementById('app-mount');
    }
}
