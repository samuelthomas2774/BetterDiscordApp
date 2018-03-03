/**
 * BetterDiscord Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeManager } from 'modules';
import { Utils } from 'common';
import { SettingUpdatedEvent, SettingsUpdatedEvent } from 'structs';
import EventEmitter from 'events';

export default class Setting {

    constructor(args) {
        this.args = args.args || args;

        if (!this.args.hasOwnProperty('value'))
            this.args.value = this.defaultValue;
        if (!this.args.hasOwnProperty('saved_value'))
            this.args.saved_value = this.args.value;

        this.emitter = new EventEmitter();
        this.changed = !Utils.compare(this.args.value, this.args.saved_value);
    }

    get id() {
        return this.args.id;
    }

    get type() {
        return this.args.type;
    }

    get value() {
        return this.args.value;
    }

    set value(value) {
        this.setValue(value);
    }

    get defaultValue() {
        return undefined;
    }

    get text() {
        return this.args.text;
    }

    get hint() {
        return this.args.hint;
    }

    get path() {
        return this.args.path;
    }

    get disabled() {
        return this.args.disabled || false;
    }

    get fullwidth() {
        return this.args.fullwidth || false;
    }

    merge(newSetting, emit_multi = true) {
        return this.setValue(newSetting.args ? newSetting.args.value : newSetting.value, emit_multi);
    }

    setValue(value, emit_multi = true, emit = true) {
        const old_value = this.args.value;
        if (Utils.compare(value, old_value)) return [];
        this.args.value = value;
        this.changed = !Utils.compare(this.args.value, this.args.saved_value);

        const updatedSetting = {
            setting: this, setting_id: this.id,
            value, old_value
        };

        if (emit)
            this.emit('setting-updated', new SettingUpdatedEvent(updatedSetting));

        if (emit_multi)
            this.emit('settings-updated', new SettingsUpdatedEvent({
                updatedSettings: [updatedSetting]
            }));

        return [updatedSetting];
    }

    setSaved() {
        this.args.saved_value = this.args.value;
        this.changed = false;
    }

    setContentPath(contentPath) {
        this.args.path = contentPath;
    }

    strip() {
        return {
            id: this.id,
            value: this.args.value
        };
    }

    clone() {
        return new this.constructor(Utils.deepclone(this.args));
    }

    toSCSS() {
        if (typeof this.value === 'boolean' || typeof this.value === 'number') {
            return this.value;
        }

        if (typeof this.value === 'string') {
            return ThemeManager.toSCSSString(this.value);
        }
    }

    on(...args) { return this.emitter.on(...args); }
    off(...args) { return this.emitter.removeListener(...args); }
    emit(...args) { return this.emitter.emit(...args); }

}
