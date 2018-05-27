/**
 * BetterDiscord Keybind Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from './basesetting';
import Combokeys from 'combokeys';

let keybindsPaused = false;

export default class KeybindSetting extends Setting {

    constructor(args, ...merge) {
        super(args, ...merge);

        this.__keybind_activated = this.__keybind_activated.bind(this);

        this.combokeys = new Combokeys(document);
        this.combokeys.bind(this.value, this.__keybind_activated);
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return '';
    }

    setValueHook() {
        this.combokeys.reset();
        this.combokeys.bind(this.value, this.__keybind_activated);
    }

    __keybind_activated(event) {
        if (KeybindSetting.paused) return;
        this.emit('keybind-activated', event);
    }

    static get paused() {
        return keybindsPaused;
    }

    static set paused(paused) {
        keybindsPaused = paused;
    }

}
