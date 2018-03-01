/**
 * BetterDiscord Array Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeManager } from 'modules';
import { Utils } from 'common';
import Setting from './basesetting';
import SettingsSet from '../settingsset';
import SettingsCategory from '../settingscategory';
import SettingsScheme from '../settingsscheme';

export default class ArraySetting extends Setting {

    constructor(args) {
        super(args);

        console.log(this);

        this.args.settings = this.settings.map(category => new SettingsCategory(category));
        this.args.schemes = this.schemes.map(scheme => new SettingsScheme(scheme));
        this.args.items = this.value ? this.value.map(item => this.createItem(item.args || item)) : [];

        this.updateValue(false, false);
    }

    get defaultValue() {
        return [];
    }

    get items() {
        return this.args.items || [];
    }

    set items(items) {
        this.args.items = items ? items.map(item => this.createItem(item)) : [];
        this.updateValue();
    }

    get fullwidth() {
        return false;
    }

    get settings() {
        return this.args.settings || [];
    }

    get schemes() {
        return this.args.schemes || [];
    }

    get inline() {
        return this.args.inline || false;
    }

    get allow_external() {
        return this.args.allow_external || !this.inline;
    }

    get min() {
        return this.args.min || 0;
    }

    get max() {
        return this.args.max || null;
    }

    addItem(item) {
        const newItem = this.createItem(item);
        this.args.items.push(newItem);
        // this.items = this.items;
        this.updateValue();
        return newItem;
    }

    removeItem(item) {
        this.args.items = this.items.filter(i => i !== item);
        this.updateValue();
    }

    createItem(item) {
        const set = new SettingsSet({
            settings: Utils.deepclone(this.settings),
            schemes: this.schemes
        });

        if (item) set.merge(item.args || item);
        set.setSaved();
        set.on('settings-updated', () => this.updateValue());
        return set;
    }

    setValue(value, emit_multi = true, emit = true) {
        this.items = value;
        // this.__proto__.__proto__.apply(this, arguments);
    }

    updateValue(emit_multi = true, emit = true) {
        return this.__proto__.__proto__.setValue.call(this, this.items.map(item => {
            console.log('ArraySetting.updateValue:', item);
            if (!item) return;
            item.setSaved();
            return item.strip();
        }), emit_multi, emit);
    }

    setContentPath(contentPath) {
        this.args.path = contentPath;

        for (let category of this.settings) {
            for (let setting of category.settings) {
                if (setting.type === 'array' || setting.type === 'custom') setting.setContentPath(contentPath);
            }
        }
    }

    async toSCSS() {
        const maps = [];
        for (let item of this.items)
            maps.push(await ThemeManager.getConfigAsSCSSMap(item.settings));

        // Final comma ensures the variable is a list
        return maps.length ? maps.join(', ') + ',' : '()';
    }

    clone() {
        return new ArraySetting(Utils.deepclone(this.args));
    }

}
