/**
 * BetterDiscord Builtin Module Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings } from 'modules';

export default class BuiltinModule {

    constructor() {
        this._settingUpdated = this._settingUpdated.bind(this);
        if (this.enabled) this.enabled = this.enabled.bind(this);
        if (this.disabled) this.disabled = this.disabled.bind(this);
    }

    init() {
        this.setting.on('setting-updated', this._settingUpdated);
        if (this.setting.value && this.enabled) this.enabled();
    }

    get setting() {
        return Settings.getSetting(...this.settingPath);
    }

    _settingUpdated(e) {
        const { value } = e;
        if (value === true && this.enabled) this.enabled(e);
        if (value === false && this.disabled) this.disabled(e);
    }

}
