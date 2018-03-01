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
import path from 'path';

export default class CustomSetting extends Setting {

    constructor(args) {
        super(args);

        if (this.args.class_file && this.path)
            this.setClass(this.args.class_file, this.args.class);
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

    get debug() {
        return this.args.debug || false;
    }

    setContentPath(_path) {
        this.args.path = _path;

        if (this.args.class_file)
            this.setClass(this.args.class_file, this.args.class);

        console.log(`Custom setting ${this.id}:`, this);
    }

    setClass(class_file, class_export) {
        const component = window.require(path.join(this.path, this.args.class_file));
        const setting_class = class_export ? component[class_export](CustomSetting) : component.default ? component.default(CustomSetting) : component(CustomSetting);

        if (!(setting_class.prototype instanceof CustomSetting))
            throw {message: 'Custom setting class function returned a class that doesn\'t extend from CustomSetting.'};

        this.__proto__ = setting_class.prototype;
    }

}
