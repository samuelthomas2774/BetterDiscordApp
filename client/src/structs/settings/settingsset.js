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
import { ClientLogger as Logger, AsyncEventEmitter } from 'common';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';
import { Modals } from 'ui';

export default class SettingsSet {

    constructor(args, ...merge) {
        this.emitter = new AsyncEventEmitter();
        this.args = args.args || args;

        this.args.categories = this.categories.map(category => new SettingsCategory(category));
        this.args.schemes = this.schemes.map(scheme => new SettingsScheme(scheme));

        for (let newSet of merge) {
            this._merge(newSet);
        }

        for (let category of this.categories) {
            category.on('setting-updated', ({ setting, value, old_value }) => this.emit('setting-updated', new SettingUpdatedEvent({
                set: this, set_id: this.id,
                category, category_id: category.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
            category.on('settings-updated', ({ updatedSettings }) => this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings: updatedSettings.map(updatedSetting => new SettingUpdatedEvent(Object.assign({
                    set: this, set_id: this.id
                }, updatedSetting)))
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

    get hidden() {
        return this.args.hidden || false;
    }

    get categories() {
        return this.args.categories || this.args.settings || [];
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

    findCategories(f) {
        return this.categories.filter(f);
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

    findSettings(f) {
        return this.findSettingsInCategory(() => true, f);
    }

    findSettingInCategory(cf, f) {
        for (let category of this.categories.filter(cf)) {
            const setting = category.find(f);
            if (setting) return setting;
        }
    }

    findSettingsInCategory(cf, f) {
        let settings = [];
        for (let category of this.categories.filter(cf)) {
            settings = settings.concat(category.findSettings(f));
        }
        return settings;
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

    /**
     * Merges a set into this set without emitting events (and therefore synchronously).
     * Only exists for use by the constructor.
     */
    _merge(newSet, emit_multi = true) {
        let updatedSettings = [];
        // const categories = newSet instanceof Array ? newSet : newSet.settings;
        const categories = newSet && newSet.args ? newSet.args.settings : newSet ? newSet.settings : newSet;
        if (!categories) return [];

        for (let newCategory of categories) {
            const category = this.find(category => category.category === newCategory.category);
            if (!category) {
                Logger.warn('SettingsCategory', `Trying to merge category ${newCategory.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = category._merge(newCategory, false);
            if (!updatedSetting) continue;
            updatedSettings = updatedSettings.concat(updatedSetting.map(({ category, setting, value, old_value }) => ({
                set: this, set_id: this.id,
                category, category_id: category.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
        }

        return updatedSettings;
    }

    async merge(newSet, emit_multi = true) {
        let updatedSettings = [];
        // const categories = newSet instanceof Array ? newSet : newSet.settings;
        const categories = newSet && newSet.args ? newSet.args.settings : newSet ? newSet.settings : newSet;
        if (!categories) return [];

        for (let newCategory of categories) {
            const category = this.find(category => category.category === newCategory.category);
            if (!category) {
                Logger.warn('SettingsCategory', `Trying to merge category ${newCategory.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = await category.merge(newCategory, false);
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

    clone(...merge) {
        return new SettingsSet({
            id: this.id,
            text: this.text,
            headertext: this.headertext,
            settings: this.categories.map(category => category.clone()),
            schemes: this.schemes.map(scheme => scheme.clone())
        }, ...merge);
    }

    on(...args) { return this.emitter.on(...args); }
    off(...args) { return this.emitter.removeListener(...args); }
    emit(...args) { return this.emitter.emit(...args); }

}
