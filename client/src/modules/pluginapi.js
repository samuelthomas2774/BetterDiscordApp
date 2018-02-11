/**
 * BetterDiscord Plugin Api
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { ClientLogger as Logger } from 'common';

export default class PluginApi {

    constructor(pluginInfo) {
        this.pluginInfo = pluginInfo;
    }

    loggerLog(message) { Logger.log(this.pluginInfo.name, message) }
    loggerErr(message) { Logger.err(this.pluginInfo.name, message) }
    loggerWarn(message) { Logger.warn(this.pluginInfo.name, message) }
    loggerInfo(message) { Logger.info(this.pluginInfo.name, message) }
    loggerDbg(message) { Logger.dbg(this.pluginInfo.name, message) }
    get Logger() {
        return {
            log: this.loggerLog.bind(this),
            err: this.loggerErr.bind(this),
            warn: this.loggerWarn.bind(this),
            info: this.loggerInfo.bind(this),
            dbg: this.loggerDbg.bind(this)
        };
    }


    get Events() {
        return {
            
        }
    }
    
}
