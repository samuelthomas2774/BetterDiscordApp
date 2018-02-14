/**
 * BetterDiscord Setting Updated Event Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Event from './event';

export default class SettingUpdatedEvent extends Event {

    get set() {
        return this.args.set_id;
    }

    get category() {
        return this.args.category_id;
    }

    get setting() {
        return this.args.setting_id;
    }

    get value() {
        return this.args.value;
    }

    get old_value() {
        return this.args.old_value;
    }

    get __eventType() {
        return 'setting-updated';
    }

}
