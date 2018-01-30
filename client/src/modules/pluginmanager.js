/**
 * BetterDiscord Plugin Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ContentManager from './contentmanager';
import Plugin from './plugin';

export default class extends ContentManager {

    static get localPlugins() {
        return this.localContent;
    }

    static get moduleName() {
        return 'PluginManager';
    }

    static get pathId() {
        return 'plugins';
    }

    static get loadAllPlugins() {
        return this.loadAllContent;
    }

    static get loadContent() { return this.loadPlugin }
    static async loadPlugin(paths, configs, info, main) {
        const plugin = window.require(paths.mainPath)(Plugin, {}, {});
        const instance = new plugin({ configs, info, main, paths: { pluginPath: paths.contentPath, dirName: paths.dirName } });

        if (instance.enabled) instance.start();
        return instance;
    }

}
