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
import { FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';

export default class {
    static async loadSettings() {
        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            const user_config = await FileUtils.readJsonFromFile(settingsPath);
            const { settings, scss } = user_config;

            this.settings = defaultSettings;

            for (let newSet of settings) {
                let set = this.settings.find(s => s.id === newSet.id);
                if (!set) continue;

                for (let newCategory of newSet.settings) {
                    let category = set.settings.find(c => c.category === newCategory.category);
                    if (!category) continue;

                    for (let newSetting of newCategory.settings) {
                        let setting = category.settings.find(s => s.id === newSetting.id);
                        if (!setting) continue;

                        setting.value = newSetting.value;
                    }
                }
            }

            CssEditor.updateScss(scss, true);
        } catch (err) {
            // There was an error loading settings
            // This probably means that the user doesn't have any settings yet
            Logger.err('Settings', err);
        }
    }

    static async saveSettings() {
        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            await FileUtils.writeJsonToFile(settingsPath, {
                settings: this.getSettings.map(set => {
                    return {
                        id: set.id,
                        settings: set.settings.map(category => {
                            return {
                                category: category.category,
                                settings: category.settings.map(setting => {
                                    return {
                                        id: setting.id,
                                        value: setting.value
                                    };
                                })
                            };
                        })
                    };
                }),
                scss: CssEditor.scss
            });
        } catch (err) {
            // There was an error loading settings
            // This probably means that the user doesn't have any settings yet
            Logger.err('Settings', err);
        }
    }

    static getSet(set_id) {
        return this.getSettings.find(s => s.id === set_id);
    }

    static getCategory(set_id, category_id) {
        const set = this.getSet(set_id);
        if (!set) return;

        return set.settings.find(c => c.category === category_id);
    }

    static getSetting(set_id, category_id, setting_id) {
        const category = this.getCategory(set_id, category_id);
        if (!category) return;

        return category.settings.find(s => s.id === setting_id);
    }

    static get(set_id, category_id, setting_id) {
        const setting = this.getSetting(set_id, category_id, setting_id);
        return setting ? setting.value : undefined;
    }

    static setSetting(set_id, category_id, setting_id, value) {
        for (let set of this.getSettings) {
            if (set.id !== set_id) continue;

            for (let category of set.settings) {
                if (category.category !== category_id) continue;

                for (let setting of category.settings) {
                    if (setting.id !== setting_id) continue;
                    if (setting.value === value) return true;

                    setting.value = value;
                    this.settingUpdated(set_id, category_id, setting_id, value);
                    return true;
                }
            }
        }

        return false;
    }

    static settingUpdated(set_id, category_id, setting_id, value) {
        Logger.log('Settings', `${set_id}/${category_id}/${setting_id} was set to ${value}`);
    }

    static get getSettings() {
        return this.settings ? this.settings : defaultSettings;
    }

    static get dataPath() {
        return this._dataPath ? this._dataPath : (this._dataPath = Globals.getObject('paths').find(p => p.id === 'data').path);
    }
}
