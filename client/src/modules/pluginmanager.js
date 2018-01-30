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

const localPlugins = [];

export default class {

    static get localPlugins() {
        return localPlugins;
    }

    static get pluginsPath() {
        return Globals.getObject('paths').find(path => path.id === 'plugins').path;
    }

}
