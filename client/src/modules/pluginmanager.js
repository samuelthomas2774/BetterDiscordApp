/**
 * BetterDiscord Plugin Manager Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Globals from './globals';
import { FileUtils, ClientLogger as Logger } from 'common';

const localPlugins = [];

export default class {

    static get localPlugins() {
        return localPlugins;
    }

    static get pluginsPath() {
        Logger.log('PluginManager', 'hi!');
        return Globals.getObject('paths').find(path => path.id === 'plugins').path;
    }

    static async loadAllPlugins() {
        try {
            const directories = await FileUtils.readDir(this.pluginsPath);

            for (let dir of directories) {
                try {
                    await this.loadPlugin(dir);
                } catch (err) {
                    //We don't want every plugin to fail loading when one does
                    Logger.err('PluginManager', err);
                }
            }

            return this.plugins;
        } catch (err) {
            throw err;
        }
    }

}
