/**
 * BetterDiscord Discord Socket Proxy Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger } from 'common';
import EventListener from './eventlistener';

export default class SocketProxy extends EventListener {

    bindings() {
        this.socketCreated = this.socketCreated.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    get eventBindings() {
        return [
            { id: 'socket-created', callback: this.socketCreated }
        ];
    }

    get socket() {
        return this.activeSocket;
    }

    socketCreated(socket) {
        this.activeSocket = socket;
        // socket.addEventListener('message', this.onMessage);
    }

    onMessage(e) {
        Logger.info('SocketProxy', e);
    }

}
