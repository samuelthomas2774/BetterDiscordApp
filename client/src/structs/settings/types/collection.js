/**
 * BetterDiscord Collection Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from '../setting';
import Base from './basesetting';
import SettingsSet from '../settingsset';
import SettingsCategory from '../settingscategory';
import SettingsScheme from '../settingsscheme';

export default class CollectionSetting extends Base {

    constructor(args, ...merge) {
        super(args, ...merge);
        this.subtype = args.type[0];
        this.args.type = 'collection';
        this.items = this.value.map(item => this.create(item));
    }

    create(item) {
        item.type = this.subtype;
        return new Setting(item);
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return [];
    }
}
