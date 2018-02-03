/**
 * BetterDiscord Plugin Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { FileUtils } from 'common';

export default class {

    constructor(pluginInternals) {
        this.__pluginInternals = pluginInternals;
        this.saveSettings = this.saveSettings.bind(this);
        this.hasSettings = this.pluginConfig && this.pluginConfig.length > 0;
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    get configs() { return this.__pluginInternals.configs }
    get info() { return this.__pluginInternals.info }
    get paths() { return this.__pluginInternals.paths }
    get main() { return this.__pluginInternals.main }
    get defaultConfig() { return this.configs.defaultConfig }
    get userConfig() { return this.configs.userConfig }
    get name() { return this.info.name }
    get authors() { return this.info.authors }
    get version() { return this.info.version }
    get pluginPath() { return this.paths.contentPath }
    get dirName() { return this.paths.dirName }
    get enabled() { return this.userConfig.enabled }
    get pluginConfig() { return this.userConfig.config }

    getSetting(settingId) {
        return this.userConfig.config.find(setting => setting.id === settingId);
    }

    saveSettings(newSettings) {
        console.log(this);
        let changed = false;
        for (let newSetting of newSettings) {
            const setting = this.pluginConfig.find(s => s.id === newSetting.id && s.value !== newSetting.value);
            if (!setting) continue;
            setting.value = newSetting.value;
            if (this.settingSaved) this.settingSaved(setting);
            changed = true;
        }
        if (changed && this.settingsSaved) this.settingsSaved(this.pluginConfig);
        FileUtils.writeFile(`${this.pluginPath}/user.config.json`, JSON.stringify({enabled: this.enabled, config: this.pluginConfig}));
    }

    start() {
        if (this.onStart) {
            const started = this.onStart();
            if (started) {
                return this.userConfig.enabled = true;
            }
            return false;
        }
        return this.userConfig.enabled = true; //Assume plugin started since it doesn't have onStart
    }

    stop() {
        if (this.onStop) {
            const stopped = this.onStop();
            if (stopped) {
                this.userConfig.enabled = false;
                return true;
            }
            return false;
        }
        this.userConfig.enabled = false;
        return true; //Assume plugin stopped since it doesn't have onStop
    }

}
