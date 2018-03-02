/**
 * BetterDiscord Theme Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';
import Theme from './theme';
import { FileUtils } from 'common';
import path from 'path';

export default class ThemeManager extends ContentManager {

    static get localThemes() {
        return this.localContent;
    }

    static get contentType() {
        return 'theme';
    }

    static get moduleName() {
        return 'Theme Manager';
    }

    static get pathId() {
        return 'themes';
    }

    static get loadAllThemes() { return this.loadAllContent }
    static get refreshThemes() { return this.refreshContent }

    static get loadContent() { return this.loadTheme }
    static async loadTheme(paths, configs, info, main) {
        try {
            const instance = new Theme({
                configs, info, main,
                paths: {
                    contentPath: paths.contentPath,
                    dirName: paths.dirName,
                    mainPath: paths.mainPath
                }
            });
            if (!instance.css) instance.recompile();
            else if (instance.enabled) instance.enable();
            return instance;
        } catch (err) {
            throw err;
        }
    }

    static get unloadTheme() { return this.unloadContent }
    static async reloadTheme(theme) {
        theme = await this.reloadContent(theme);
        theme.recompile();
    }

    static enableTheme(theme) {
        theme.enable();
    }

    static disableTheme(theme) {
        theme.disable();
    }

    static get isTheme() { return this.isThisContent }
    static isThisContent(theme) {
        return theme instanceof Theme;
    }

    static async getConfigAsSCSS(settingsset) {
        const variables = [];

        for (let category of settingsset.categories) {
            for (let setting of category.settings) {
                const setting_scss = await this.parseSetting(setting);
                if (setting_scss) variables.push(`$${setting_scss[0]}: ${setting_scss[1]};`);
            }
        }

        return variables.join('\n');
    }

    static async getConfigAsSCSSMap(settingsset) {
        const variables = [];

        for (let category of settingsset.categories) {
            for (let setting of category.settings) {
                const setting_scss = await this.parseSetting(setting);
                if (setting_scss) variables.push(`${setting_scss[0]}: (${setting_scss[1]})`);
            }
        }

        return '(' + variables.join(', ') + ')';
    }

    static async parseSetting(setting) {
        const { type, id, value } = setting;
        const name = id.replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-');
        const scss = await setting.toSCSS();

        if (scss) return [name, scss];
    }

    static toSCSSString(value) {
        if (typeof value !== 'string' && value.toString) value = value.toString();
        return `'${typeof value === 'string' ? value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') : ''}'`;
    }

}
