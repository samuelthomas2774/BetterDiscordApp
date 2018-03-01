/**
 * BetterDiscord Custom Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from './basesetting';
import SettingsCategory from '../settingscategory';
import SettingsScheme from '../settingsscheme';

export default class CustomSetting extends Setting {

    constructor(args) {
        super(args);

        if (this.args.class_file) {
            const component = window.require(path.join(this.path, this.args.class_file));
            const setting_class = this.args.class ? component[this.args.class](CustomSetting) : component.default ? component.default(CustomSetting) : component(CustomSetting);

            const setting = new setting_class(this.args);
            if (setting instanceof CustomSetting) return setting;
        }
    }

    get file() {
        return this.args.file;
    }

    get function() {
        return this.args.function;
    }

    get component() {
        return this.args.component;
    }

    get path() {
        return this.args.path;
    }

    get debug() {
        return this.args.debug || false;
    }

}
