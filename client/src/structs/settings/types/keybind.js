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

export default class KeybindSetting extends Setting {

    constructor(args, ...merge) {
        super(args, ...merge);

        this.combokeys = new Combokeys(document);
        this.combokeys.bind(this.value, event => this.emit('keybind-activated', event));
    }

    setValueHook() {
        this.combokeys.reset();
        this.combokeys.bind(this.value, event => this.emit('keybind-activated', event));
    }

}
