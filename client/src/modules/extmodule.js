/**
 * BetterDiscord External Module Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { AsyncEventEmitter } from 'common';
import { EventEmitter } from 'events';

export default class ExtModule {

    constructor(pluginInternals) {
        this.__pluginInternals = pluginInternals;
        this.__require = window.require(this.paths.mainPath);
        this.hasSettings = false;
    }

    get type() { return 'module' }
    get configs() { return this.__pluginInternals.configs }
    get info() { return this.__pluginInternals.info }
    get icon() { return this.info.icon }
    get paths() { return this.__pluginInternals.paths }
    get main() { return this.__pluginInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get configSchemes() { return this.configs.schemes }
    get id() { return this.info.id || this.name.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-').replace(/--/g, '-') }
    get name() { return this.info.name }
    get description() { return this.info.description }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get contentPath() { return this.paths.contentPath }
    get modulePath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return true }
    get config() { return this.userConfig.config || [] }
    get data() { return this.userConfig.data || (this.userConfig.data = {}) }
    get events() { return this.EventEmitter ? this.EventEmitter : (this.EventEmitter = new AsyncEventEmitter()) }

}
