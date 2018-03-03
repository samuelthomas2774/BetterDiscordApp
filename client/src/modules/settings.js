/**
 * BetterDiscord Settings Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import defaultSettings from '../data/user.settings.default';
import Globals from './globals';
import CssEditor from './csseditor';
import Events from './events';
import { Utils, FileUtils, ClientLogger as Logger } from 'common';
import { SettingsSet, SettingUpdatedEvent } from 'structs';
import path from 'path';

export default new class Settings {
    constructor() {
        this.settings = [];
    }

    async loadSettings() {
        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            const user_config = await FileUtils.readJsonFromFile(settingsPath);
            const { settings, scss, css, css_editor_files, scss_error, css_editor_bounds } = user_config;

            this.settings = defaultSettings.map(set => {
                const newSet = new SettingsSet(set);
                newSet.merge(settings.find(s => s.id === newSet.id));
                newSet.setSaved();
                newSet.on('setting-updated', event => {
                    const { category, setting, value, old_value } = event;
                    Logger.log('Settings', `${newSet.id}/${category.id}/${setting.id} was changed from ${old_value} to ${value}`);
                    Events.emit('setting-updated', event);
                    Events.emit(`setting-updated-${newSet.id}_${category.id}_${setting.id}`, event);
                });
                newSet.on('settings-updated', async (event) => {
                    await this.saveSettings();
                    Events.emit('settings-updated', event);
                });
                return newSet;
            });

            CssEditor.setState(scss, css, css_editor_files, scss_error);
            CssEditor.editor_bounds = css_editor_bounds || {};
        } catch (err) {
            // There was an error loading settings
            // This probably means that the user doesn't have any settings yet
            Logger.err('Settings', err);
        }
    }

    async saveSettings() {
        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            await FileUtils.writeJsonToFile(settingsPath, {
                settings: this.settings.map(set => set.strip()),
                scss: CssEditor.scss,
                css: CssEditor.css,
                css_editor_files: CssEditor.files,
                scss_error: CssEditor.error,
                css_editor_bounds: {
                    width: CssEditor.editor_bounds.width,
                    height: CssEditor.editor_bounds.height,
                    x: CssEditor.editor_bounds.x,
                    y: CssEditor.editor_bounds.y
                }
            });

            for (let set of this.getSettings) {
                set.setSaved();
            }
        } catch (err) {
            // There was an error saving settings
            Logger.err('Settings', err);
            throw err;
        }
    }

    getSet(set_id) {
        return this.getSettings.find(s => s.id === set_id);
    }

    get core() { return this.getSet('core') }
    get ui() { return this.getSet('ui') }
    get emotes() { return this.getSet('emotes') }
    get css() { return this.getSet('css') }
    get security() { return this.getSet('security') }

    getCategory(set_id, category_id) {
        const set = this.getSet(set_id);
        return set ? set.getCategory(category_id) : undefined;
    }

    getSetting(set_id, category_id, setting_id) {
        const set = this.getSet(set_id);
        return set ? set.getSetting(category_id, setting_id) : undefined;
    }

    get(set_id, category_id, setting_id) {
        const set = this.getSet(set_id);
        return set ? set.get(category_id, setting_id) : undefined;
    }

    async mergeSettings(set_id, newSettings) {
        const set = this.getSet(set_id);
        if (!set) return;

        return await set.merge(newSettings);
    }

    setSetting(set_id, category_id, setting_id, value) {
        const setting = this.getSetting(set_id, category_id, setting_id);
        if (!setting) throw {message: `Tried to set ${set_id}/${category_id}/${setting_id}, which doesn't exist`};
        setting.value = value;
    }

    get getSettings() {
        return this.settings;
    }

    get dataPath() {
        return this._dataPath ? this._dataPath : (this._dataPath = Globals.getObject('paths').find(p => p.id === 'data').path);
    }
}
