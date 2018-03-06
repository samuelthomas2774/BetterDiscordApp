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

let instances = 0;

export default class SettingsSet {

    constructor(args, ...merge) {
        this.emitter = new AsyncEventEmitter();
        this.args = args.args || args;

        this.args.categories = this.categories.map(category => new SettingsCategory(category));
        this.args.schemes = this.schemes.map(scheme => new SettingsScheme(scheme));

        for (let newSet of merge) {
            this._merge(newSet);
        }

        this._eventsKey = instances++;

        for (let category of this.categories) {
            this._bindCategoryEvents(category);
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
     * Binds events to a category.
     * This only exists for use by the constructor and settingsset.addCategory.
     */
    _bindCategoryEvents(category) {
        category.on('setting-updated', category[this._eventsKey + '_settingsset_event_setting-updated'] = ({ setting, value, old_value }) => this.emit('setting-updated', new SettingUpdatedEvent({
            set: this, set_id: this.id,
            category, category_id: category.id,
            setting, setting_id: setting.id,
            value, old_value
        })));
        category.on('settings-updated', category[this._eventsKey + '_settingsset_event_settings-updated'] = ({ updatedSettings }) => this.emit('settings-updated', new SettingsUpdatedEvent({
            updatedSettings: updatedSettings.map(updatedSetting => new SettingUpdatedEvent(Object.assign({
                set: this, set_id: this.id
            }, updatedSetting)))
        })));
        category.on('added-setting', category[this._eventsKey + '_settingsset_event_added-setting'] = ({ setting, at_index }) => this.emit('added-setting', {
            set: this, set_id: this.id,
            category, category_id: category.id,
            setting, setting_id: setting.id,
            at_index
        }));
        category.on('removed-setting', category[this._eventsKey + '_settingsset_event_removed-setting'] = ({ setting, from_index }) => this.emit('removed-setting', {
            set: this, set_id: this.id,
            category, category_id: category.id,
            setting, setting_id: setting.id,
            from_index
        }));
    }

    /**
     * Dynamically adds a category to this set.
     * @param {SettingsCategory} category The category to add to this set
     * @param {Number} index The index to add the category at (optional)
     * @return {Promise}
     */
    async addCategory(category, index) {
        if (this.categories.find(c => c === category)) return;

        if (!(category instanceof SettingsCategory))
            category = new SettingsCategory(category);

        if (this.getCategory(category.id))
            throw {message: 'A category with this ID already exists.'};

        this._bindCategoryEvents(category);
        if (index === undefined) index = this.categories.length;
        this.categories.splice(index, 0, category);

        const event = {
            set: this, set_id: this.id,
            category, category_id: category.id,
            at_index: index
        };

        await category.emit('added-to', event);
        await this.emit('added-category', event);
        return category;
    }

    /**
     * Dynamically removes a category from this set.
     * @param {SettingsCategory} category The category to remove from this set
     * @return {Promise}
     */
    async removeCategory(category) {
        category.off('setting-updated', category[this._eventsKey + '_settingsset_event_setting-updated']);
        category.off('settings-updated', category[this._eventsKey + '_settingsset_event_settings-updated']);
        category.off('added-setting', category[this._eventsKey + '_settingsset_event_added-setting']);
        category.off('removed-setting', category[this._eventsKey + '_settingsset_event_removed-setting']);

        let index;
        while ((index = this.categories.findIndex(c => c === category)) > -1) {
            this.categories.splice(index, 0);
        }

        const event = {
            set: this, set_id: this.id,
            category, category_id: category.id,
            from_index: index
        };

        await category.emit('removed-from', event);
        await this.emit('removed-category', event);
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
