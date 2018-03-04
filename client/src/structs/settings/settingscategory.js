/**
 * BetterDiscord Settings Category Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Setting from './setting';
import { ClientLogger as Logger, AsyncEventEmitter } from 'common';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';

export default class SettingsCategory {

    constructor(args, ...merge) {
        this.emitter = new AsyncEventEmitter();
        this.args = args.args || args;

        this.args.settings = this.settings.map(setting => new Setting(setting));

        for (let newCategory of merge) {
            this._merge(newCategory);
        }

        for (let setting of this.settings) {
            setting.on('setting-updated', ({ value, old_value }) => this.emit('setting-updated', new SettingUpdatedEvent({
                category: this, category_id: this.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
            setting.on('settings-updated', ({ updatedSettings }) => this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings: updatedSettings.map(updatedSetting => new SettingUpdatedEvent(Object.assign({
                    category: this, category_id: this.id
                }, updatedSetting)))
            })));
        }
    }

    get id() {
        return this.args.id || this.args.category;
    }

    get category() {
        return this.id;
    }

    get name() {
        return this.args.category_name;
    }

    get category_name() {
        return this.name;
    }

    get type() {
        return this.args.type;
    }

    get settings() {
        return this.args.settings || [];
    }

    get changed() {
        if (this.settings.find(setting => setting.changed)) return true;
        return false;
    }

    find(f) {
        return this.settings.find(f);
    }

    findSettings(f) {
        return this.settings.filter(f);
    }

    getSetting(id) {
        return this.findSetting(setting => setting.id === id);
    }

    /**
     * Merges a category into this category without emitting events (and therefore synchronously).
     * Only exists for use by SettingsSet.
     */
    _merge(newCategory) {
        let updatedSettings = [];

        for (let newSetting of newCategory.settings) {
            const setting = this.settings.find(setting => setting.id === newSetting.id);
            if (!setting) {
                Logger.warn('SettingsCategory', `Trying to merge setting ${this.id}/${newSetting.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = setting._merge(newSetting);
            if (!updatedSetting) continue;
            updatedSettings = updatedSettings.concat(updatedSetting.map(({ setting, value, old_value }) => ({
                category: this, category_id: this.id,
                setting, setting_id: setting.id,
                value, old_value
            })));
        }

        return updatedSettings;
    }

    async merge(newCategory, emit_multi = true) {
        let updatedSettings = [];

        for (let newSetting of newCategory.settings) {
            const setting = this.settings.find(setting => setting.id === newSetting.id);
            if (!setting) {
                Logger.warn('SettingsCategory', `Trying to merge setting ${this.id}/${newSetting.id}, which does not exist.`);
                continue;
            }

            const updatedSetting = await setting._merge(newSetting, false);
            if (!updatedSetting) continue;
            updatedSettings = updatedSettings.concat(updatedSetting.map(({ setting, value, old_value }) => ({
                category: this, category_id: this.id,
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
        for (let setting of this.settings) {
            setting.setSaved();
        }
    }

    strip() {
        return {
            category: this.category,
            settings: this.settings.map(setting => setting.strip())
        };
    }

    clone(...merge) {
        return new SettingsCategory({
            id: this.id,
            category: this.id,
            name: this.name,
            category_name: this.category_name,
            type: this.type,
            settings: this.settings.map(setting => setting.clone())
        }, ...merge);
    }

    on(...args) { return this.emitter.on(...args); }
    off(...args) { return this.emitter.removeListener(...args); }
    emit(...args) { return this.emitter.emit(...args); }

}
