/**
 * BetterDiscord Settings Set Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import SettingsCategory from './settingscategory';
import SettingsScheme from './settingsscheme';
import { AsyncEventEmitter } from 'common';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';
import { Modals } from 'ui';

export default class SettingsSet {

    constructor(args) {
        this.emitter = new AsyncEventEmitter();
        this.args = args.args || args;

        this.args.settings = this.settings.map(category => new SettingsCategory(category));
        this.args.schemes = this.schemes.map(scheme => new SettingsScheme(scheme));

        for (let category of this.settings) {
            category.on('setting-updated', ({ setting, value, old_value }) => this.emit('setting-updated', new SettingUpdatedEvent({
                set: this, set_id: this.id,
                category, category_id: category.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
            category.on('settings-updated', ({ updatedSettings }) => this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings: updatedSettings.map(updatedSetting => Object.assign({
                    set: this, set_id: this.id
                }, updatedSetting))
            })));
        }
    }

    get id() {
        return this.args.id;
    }

    get text() {
        return this.args.text;
    }

    get headertext() {
        return this.args.headertext || `${this.text} Settings`;
    }

    get categories() {
        return this.args.settings || [];
    }

    get settings() {
        return this.categories;
    }

    get schemes() {
        return this.args.schemes || [];
    }

    get changed() {
        if (this.categories.find(category => category.changed)) return true;
        return false;
    }

    find(f) {
        return this.categories.find(f);
    }

    getCategory(id) {
        return this.find(category => category.id === id);
    }

    findSetting(f) {
        for (let category of this.categories) {
            const setting = category.findSetting(f);
            if (setting) return setting;
        }
    }

    findSettingInCategory(cf, f) {
        for (let category of this.categories.filter(cf)) {
            const setting = category.find(f);
            if (setting) return setting;
        }
    }

    getSetting(id, sid) {
        if (sid) return this.findSettingInCategory(category => category.id === id, setting => setting.id === sid);
        return this.findSetting(setting => setting.id === id);
    }

    get(cid, sid) {
        const setting = this.getSetting(cid, sid);
        return setting ? setting.value : undefined;
    }

    showModal(headertext) {
        Modals.settings(this, headertext ? headertext : this.headertext);
    }

    async merge(newSet, emit_multi = true) {
        let updatedSettings = [];
        const categories = newSet instanceof Array ? newSet : newSet.settings;
        if (!categories) return [];

        for (let newCategory of categories) {
            const category = this.find(category => category.category === newCategory.category);
            if (!category) {
                Logger.warn('SettingsCategory', `Trying to merge category ${newCategory.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = category.merge(newCategory, false);
            if (!updatedSetting) continue;
            updatedSettings = updatedSettings.concat(updatedSetting.map(({ category, setting, value, old_value }) => ({
                set: this, set_id: this.id,
                category, category_id: category.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
        }

        if (emit_multi)
            await this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings
            }));

        return updatedSettings;
    }

    setSaved() {
        for (let category of this.categories) {
            category.setSaved();
        }
    }

    strip() {
        const stripped = {};
        if (this.id) stripped.id = this.id;
        stripped.settings = this.categories.map(category => category.strip());
        return stripped;
    }

    clone() {
        return new SettingsSet({
            id: this.id,
            text: this.text,
            headertext: this.headertext,
            settings: this.categories.map(category => category.clone()),
            schemes: this.schemes.map(scheme => scheme.clone())
        });
    }

    on(...args) { return this.emitter.on(...args); }
    off(...args) { return this.emitter.removeListener(...args); }
    emit(...args) { return this.emitter.emit(...args); }

}
