/**
 * BetterDiscord Settings Scheme Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Utils, ClientLogger as Logger } from 'common';

export default class SettingsScheme {

    constructor(args) {
        this.args = args.args || args;

        Object.freeze(this);
    }

    /**
     * The scheme's ID.
     */
    get id() {
        return this.args.id;
    }

    /**
     * The URL of the scheme's icon. This should be a base64 encoded data URI.
     */
    get icon_url() {
        return this.args.icon_url;
    }

    /**
     * The scheme's name.
     */
    get name() {
        return this.args.name;
    }

    /**
     * A string to be displayed under the scheme.
     */
    get hint() {
        return this.args.hint;
    }

    /**
     * An array of stripped settings categories this scheme manages.
     */
    get settings() {
        return this.args.settings || [];
    }

    /**
     * Checks if this scheme's values are currently applied to a set.
     * @param {SettingsSet} set The set to check
     * @return {Boolean}
     */
    isActive(set) {
        for (let schemeCategory of this.settings) {
            const category = set.categories.find(c => c.category === schemeCategory.category);
            if (!category) {
                Logger.warn('SettingsScheme', `Category ${schemeCategory.category} does not exist`);
                return false;
            }

            for (let schemeSetting of schemeCategory.settings) {
                const setting = category.settings.find(s => s.id === schemeSetting.id);
                if (!setting) {
                    Logger.warn('SettingsScheme', `Setting ${schemeCategory.category}/${schemeSetting.id} does not exist`);
                    return false;
                }

                if (!Utils.compare(setting.value, schemeSetting.value)) return false;
            }
        }

        return true;
    }

    /**
     * Applies this scheme's values to a set.
     * @param {SettingsSet} set The set to merge this scheme's values into
     * @return {Promise}
     */
    applyTo(set) {
        return set.merge(this);
    }

}
