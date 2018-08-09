/**
 * BetterDiscord Collection Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import BaseSetting from './basesetting';
import Setting from '../setting';

export default class CollectionSetting extends BaseSetting {

    constructor(args) {
        super(args);
        this.subtype = args.type[0];
        args.type = 'collection';
        this.sub = new Setting({ type: this.subtype });
    }

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return [];
    }
}
