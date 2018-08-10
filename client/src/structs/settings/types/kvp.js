/**
 * BetterDiscord String Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from './basesetting';

export default class KvpSetting extends Setting {

    /**
     * The value to use when the setting doesn't have a value.
     */
    get defaultValue() {
        return { key: 'Key', value: 'Value' };
    }
}
