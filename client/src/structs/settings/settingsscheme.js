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

        this.args.settings = this.settings.map(({ category, settings }) => ({
            category, settings: settings.map(({ id, value }) => ({
                id, value
            }))
        }));

        Object.freeze(this);
    }

    get id() {
        return this.args.id;
    }

    get icon_url() {
        return this.args.icon_url;
    }

    get name() {
        return this.args.name;
    }

    get hint() {
        return this.args.hint;
    }

    get settings() {
        return this.args.settings || [];
    }

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

    applyTo(set) {
        return set.merge({ settings: this.settings });
    }

    clone() {
        return new SettingsScheme(Utils.deepclone(this.args));
    }

}
