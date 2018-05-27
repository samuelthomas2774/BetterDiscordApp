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

    /**
     * The set containing the setting that was updated.
     */
    get set() {
        return this.args.set;
    }

    /**
     * The ID of the set containing the setting that was updated.
     */
    get set_id() {
        return this.set.id;
    }

    /**
     * The category containing the setting that was updated.
     */
    get category() {
        return this.args.category;
    }

    /**
     * The ID of the category containing the setting that was updated.
     */
    get category_id() {
        return this.category.id;
    }

    /**
     * The setting that was updated.
     */
    get setting() {
        return this.args.setting;
    }

    /**
     * The ID of the setting that was updated.
     */
    get setting_id() {
        return this.setting.id;
    }

    /**
     * The setting's new value.
     */
    get value() {
        return this.args.value;
    }

    /**
     * The setting's old value.
     */
    get old_value() {
        return this.args.old_value;
    }

    /**
     * The type of event.
     */
    get __eventType() {
        return 'setting-updated';
    }

}
