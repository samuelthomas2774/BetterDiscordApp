/**
 * BetterDiscord Settings Proxy
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SettingsSet from './settingsset';
import SettingsCategory from './settingscategory';

const setHandler = {
    get({ set }, category_id) {
        const category = set.getCategory(category_id);
        if (category) return SettingsProxy.createProxy(category);

        const setting = set.getSetting(category_id);
        if (setting) return setting.value;
    },
    set({ set }, category_id, values) {
        const category = set.getCategory(category_id);
        if (category) return category.merge(values);

        const setting = set.getSetting(category_id);
        if (setting) return setting.value = values;
    },
    has({ set }, category_id) {
        const category = set.getCategory(category_id);
        if (category) return true;

        const setting = set.getSetting(category_id);
        if (setting) return true;
    },
    getPrototypeOf({ set }) {
        return SettingsSetProxy.prototype;
    },
    setPrototypeOf({ set }) {},
    isExtensible({ set }) {
        return false;
    },
    preventExtensions({ set }) {},
    getOwnPropertyDescriptor({ set }, category_id) {
        return {
            value: setHandler.get({ set }, category_id),
            writable: true,
            enumerable: true,
            configurable: true
        };
    },
    defineProperty({ set }) {},
    deleteProperty({ set }) {},
    ownKeys({ set }) {
        return set.categories.map(c => c.id);
    }
};

const categoryHandler = {
    get({ category }, setting_id) {
        const setting = category.getSetting(setting_id);
        if (setting) return setting.value;
    },
    set({ category }, setting_id, value) {
        const setting = category.getSetting(setting_id);
        if (setting) return setting.value = value;
    },
    has({ category }, setting_id) {
        const setting = category.getSetting(setting_id);
        if (setting) return true;
    },
    getPrototypeOf({ category }) {
        return SettingsCategoryProxy.prototype;
    },
    setPrototypeOf({ category }) {},
    isExtensible({ category }) {
        return false;
    },
    preventExtensions({ category }) {},
    getOwnPropertyDescriptor({ category }, setting_id) {
        return {
            value: categoryHandler.get({ category }, setting_id),
            writable: true,
            enumerable: true,
            configurable: true
        };
    },
    defineProperty({ category }) {},
    deleteProperty({ category }) {},
    ownKeys({ category }) {
        return category.settings.map(s => s.id);
    }
};

export default class SettingsProxy {

    constructor(args) {
        Object.assign(this, args);
    }

    static createProxy(set) {
        if (set instanceof SettingsSet) return new Proxy(new SettingsSetProxy({ set }), setHandler);
        if (set instanceof SettingsCategory) return new Proxy(new SettingsCategoryProxy({ category: set }), categoryHandler);
    }

}

export class SettingsSetProxy extends SettingsProxy {}
export class SettingsCategoryProxy extends SettingsProxy {}
