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

    /**
     * Set ID
     */
    get id() {
        return this.args.id;
    }

    /**
     * Set name
     */
    get text() {
        return this.args.text;
    }

    /**
     * Text to be displayed with the set.
     */
    get headertext() {
        return this.args.headertext || `${this.text} Settings`;
    }

    set headertext(headertext) {
        this.args.headertext = headertext;
    }

    /**
     * Whether this set should be displayed.
     * Currently only used in the settings menu.
     */
    get hidden() {
        return this.args.hidden || false;
    }

    /**
     * An array of SettingsCategory objects in this set.
     */
    get categories() {
        return this.args.categories || this.args.settings || [];
    }

    get settings() {
        return this.categories;
    }

    /**
     * An array of SettingsScheme objects that can be used in this set.
     */
    get schemes() {
        return this.args.schemes || [];
    }

    /**
     * Whether any setting in this set has been changed.
     */
    get changed() {
        if (this.categories.find(category => category.changed)) return true;
        return false;
    }

    /**
     * Returns the first category where calling {function} returns true.
     * @param {Function} function A function to call to filter categories
     * @return {SettingsCategory}
     */
    find(f) {
        return this.categories.find(f);
    }

    /**
     * Returns all categories where calling {function} returns true.
     * @param {Function} function A function to call to filter categories
     * @return {Array} An array of matching SettingsCategory objects
     */
    findCategories(f) {
        return this.categories.filter(f);
    }

    /**
     * Returns the category with the ID {id}.
     * @param {String} id The ID of the category to look for
     * @return {SettingsCategory}
     */
    getCategory(id) {
        return this.find(category => category.id === id);
    }

    /**
     * Returns the first setting where calling {function} returns true.
     * @param {Function} function A function to call to filter settings
     * @return {Setting}
     */
    findSetting(f) {
        for (let category of this.categories) {
            const setting = category.find(f);
            if (setting) return setting;
        }
    }

    /**
     * Returns all settings where calling {function} returns true.
     * @param {Function} function A function to call to filter settings
     * @return {Array} An array of matching Setting objects
     */
    findSettings(f) {
        return this.findSettingsInCategory(() => true, f);
    }

    /**
     * Returns the first setting where calling {function} returns true.
     * @param {Function} categoryFunction A function to call to filter categories
     * @param {Function} function A function to call to filter settings
     * @return {Array} An array of matching Setting objects
     */
    findSettingInCategory(cf, f) {
        for (let category of this.categories.filter(cf)) {
            const setting = category.find(f);
            if (setting) return setting;
        }
    }

    /**
     * Returns all settings where calling {function} returns true.
     * @param {Function} categoryFunction A function to call to filter categories
     * @param {Function} function A function to call to filter settings
     * @return {Array} An array of matching Setting objects
     */
    findSettingsInCategory(cf, f) {
        let settings = [];
        for (let category of this.categories.filter(cf)) {
            settings = settings.concat(category.findSettings(f));
        }
        return settings;
    }

    /**
     * Returns the setting with the ID {id}.
     * @param {String} categoryid The ID of the category to look in (optional)
     * @param {String} id The ID of the setting to look for
     * @return {Setting}
     */
    getSetting(id, sid) {
        if (sid) return this.findSettingInCategory(category => category.id === id, setting => setting.id === sid);
        return this.findSetting(setting => setting.id === id);
    }

    /**
     * Returns the value of the setting with the ID {id}.
     * @param {String} categoryid The ID of the category to look in (optional)
     * @param {String} id The ID of the setting to look for
     * @return {Any}
     */
    get(cid, sid) {
        const setting = this.getSetting(cid, sid);
        return setting ? setting.value : undefined;
    }

    /**
     * Opens this set in a modal.
     * @param {String} headertext Text to be displayed in the modal header
     * @param {Object} options Additional options to pass to Modals.settings
     * @return {Modal}
     */
    showModal(headertext, options) {
        return Modals.settings(this, headertext ? headertext : this.headertext, options);
    }

    /**
     * Merges a set into this set without emitting events (and therefore synchronously).
     * This only exists for use by the constructor.
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

    /**
     * Merges another set into this set.
     * @param {SettingsSet} newSet The set to merge into this set
     * @return {Promise}
     */
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

    /**
     * Marks all settings in this set as saved (not changed).
     */
    setSaved() {
        for (let category of this.categories) {
            category.setSaved();
        }
    }

    /**
     * Returns an object that can be stored as JSON and later merged back into a set with settingsset.merge.
     * @return {Object}
     */
    strip() {
        const stripped = {};
        if (this.id) stripped.id = this.id;
        stripped.settings = this.categories.map(category => category.strip());
        return stripped;
    }

    /**
     * Returns a copy of this set that can be changed and then merged back into a set with settingsset.merge.
     * @param {SettingsSet} ...merge A set to merge into the new set
     * @return {SettingsSet}
     */
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
