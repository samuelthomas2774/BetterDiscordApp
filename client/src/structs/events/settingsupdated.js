/**
 * BetterDiscord Settings Updated Event Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Event from './event';

export default class SettingsUpdatedEvent extends Event {

    /**
     * An array of SettingUpdated events.
     */
    get updatedSettings() {
        return this.args.updatedSettings;
    }

    /**
     * The type of event.
     */
    get __eventType() {
        return 'settings-updated';
    }

}
