/**
 * BetterDiscord Plugin Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PluginManager from './pluginmanager';
import Content from './content';

export default class Plugin extends Content {

    get type() { return 'plugin' }

    get start() { return this.enable }
    get stop() { return this.disable }

    reload() {
        return PluginManager.reloadPlugin(this);
    }

    unload() {
        return PluginManager.unloadPlugin(this);
    }

}
