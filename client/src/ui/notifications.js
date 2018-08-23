/*
 * BetterDiscord Notifications
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Events } from 'modules';

export default class Notifications {

    /**
     * Add a new notification to the stack.
     * Notifications should only be used for important things.
     * @param {String} [title]
     * @param {String} text
     * @param {Object[]} [buttons] buttons to show { text: 'Text for the button', onClick: fn() { return true if notification should be dismissed } }
     */
    static add(title, text, buttons = [], ondismiss) {
        if (arguments.length <= 1) text = title, title = undefined;
        if (arguments[1] instanceof Array) [text, buttons, ondismiss] = arguments, title = undefined;

        const notification = { title, text, buttons, ondismiss };
        this.stack.push(notification);
        return notification;
    }

    /**
     * Notifications currently in the stack.
     * @type {Object[]}
     */
    static get stack() {
        return this._stack || (this._stack = []);
    }

    /**
     * Dismiss a notification at index.
     * @param {Number} index Index of the notification
     */
    static dismiss(index) {
        const notification = this.stack[index];
        if (!notification) return;
        if (notification.ondismiss) notification.ondismiss();
        this.stack.splice(index, 1);
    }

}
