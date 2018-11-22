/**
 * BetterDiscord Colored Text Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';

import { Utils } from 'common';
import { Settings, Reflection, ReactComponents, DiscordApi } from 'modules';

export default new class ColoredText extends BuiltinModule {

    /* Getters */
    get moduleName() { return 'ColoredText' }

    get settingPath() { return ['ui', 'default', 'colored-text'] }

    get intensityPath() { return ['ui', 'advanced', 'colored-text-intensity'] }

    get intensitySetting() { return Settings.getSetting(...this.intensityPath) }

    get intensity() { return 100 - this.intensitySetting.value }

    get defaultColor() { return DiscordApi.UserSettings.theme == 'light' ? '#747f8d' : '#dcddde' }

    constructor() {
        super();
        this._intensityUpdated = this._intensityUpdated.bind(this);
    }

    async enabled(e) {
        this.intensitySetting.off('setting-updated', this._intensityUpdated);
        this.intensitySetting.on('setting-updated', this._intensityUpdated);
    }

    disabled(e) {
        this.intensitySetting.off('setting-updated', this._intensityUpdated);
    }

    /* Methods */
    _intensityUpdated() {
        this.MessageContent.forceUpdateAll();
    }

    /* Patches */
    async applyPatches() {
        if (this.patches.length) return;
        this.MessageContent = await ReactComponents.getComponent('MessageContent', { selector: Reflection.resolve('container', 'containerCozy', 'containerCompact', 'edited').selector }, m => m.defaultProps && m.defaultProps.hasOwnProperty('disableButtons'));
        this.patch(this.MessageContent.component.prototype, 'render', this.injectColoredText);
        this.MessageContent.forceUpdateAll();
    }

    /**
     * Set markup text colour to match role colour
     */
    injectColoredText(thisObject, args, originalReturn) {
        this.patch(originalReturn.props, 'children', function(obj, args, returnValue) {
            const { TinyColor } = Reflection.modules;
            const markup = Utils.findInReactTree(returnValue, m => m && m.props && m.props.className && m.props.className.includes('da-markup'));
            const roleColor = thisObject.props.message.colorString;
            if (markup && roleColor) markup.props.style = {color: TinyColor.mix(roleColor, this.defaultColor, this.intensity)};
        });
    }
}
