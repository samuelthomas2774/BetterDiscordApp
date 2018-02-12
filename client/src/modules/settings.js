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
import { default as Globals } from './globals';
import { FileUtils, ClientLogger as Logger } from 'common';
import path from 'path';

export default class {
    static async loadSettings() {
        try {
            await FileUtils.ensureDirectory(this.dataPath);

            const settingsPath = path.resolve(this.dataPath, 'user.settings.json');
            const user_config = await FileUtils.readJsonFromFile(settingsPath);
            const { settings } = user_config;

            this.settings = defaultSettings;

            for (let newCategory of settings) {
                let category = this.settings.find(c => c.id === newCategory.id);
                if (!category) continue;

                for (let newSetting of newCategory.settings) {
                    let setting = category.settings.find(s => s.id === newSetting.id);
                    if (!setting) continue;

                    setting.enabled = newSetting.enabled;
                }
            }
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
                settings: this.getSettings.map(category => {
                    return {
                        id: category.id,
                        settings: category.settings.map(setting => {
                            return {
                                id: setting.id,
                                enabled: setting.enabled
                            };
                        })
                    };
                })
            });
        } catch (err) {
            // There was an error loading settings
            // This probably means that the user doesn't have any settings yet
            Logger.err('Settings', err);
        }
    }

    static get getSettings() {
        return this.settings ? this.settings : defaultSettings;
    }

    static get dataPath() {
        return this._dataPath ? this._dataPath : (this._dataPath = Globals.getObject('paths').find(p => p.id === 'data').path);
    }
}
