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
import { DOM } from 'ui';
import { FileUtils } from 'common';

class Theme {

    constructor(themeInternals) {
        this.__themeInternals = themeInternals;
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
    }

    get configs() { return this.__themeInternals.configs }
    get info() { return this.__themeInternals.info }
    get icon() { return this.info.icon }
    get paths() { return this.__themeInternals.paths }
    get main() { return this.__themeInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get themePath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get themeConfig() { return this.userConfig.config }
    get css() { return this.__themeInternals.css }
    get id() { return this.name.toLowerCase().replace(/\s+/g, '-') }

    enable() {
        DOM.injectTheme(this.css, this.id);
    }

    disable() {
        DOM.deleteTheme(this.id);
    }

}

export default class extends ContentManager {

    static get localThemes() {
        return this.localContent;
    }

    static get pathId() {
        return 'themes';
    }

    static get loadAllThemes() {
        return this.loadAllContent;
    }

    static get loadContent() { return this.loadTheme }
    static async loadTheme(paths, configs, info, main) {
        try {
            const css = await FileUtils.readFile(paths.mainPath);
            const instance = new Theme({ configs, info, main, paths: { contentPath: paths.contentPath, dirName: paths.dirName }, css });
            return instance;
        } catch (err) {
            throw err;
        }
    }

}
