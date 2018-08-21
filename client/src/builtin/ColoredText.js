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
import { Settings, Patcher, MonkeyPatch, WebpackModules, ReactComponents } from 'modules';

export default new class ColoredText extends BuiltinModule {

    constructor() {
        super();
        this._intensityUpdated = this._intensityUpdated.bind(this);
        this.injectColoredText = this.injectColoredText.bind(this);
    }

    get settingPath() {
        return ['ui', 'default', 'colored-text'];
    }

    get intensityPath() {
        return ['ui', 'advanced', 'colored-text-intensity'];
    }

    get intensitySetting() {
        return Settings.getSetting(...this.intensityPath);
    }

    get intensity() {
        return 1 - this.intensitySetting.value / 100;
    }

    _intensityUpdated() {
        this.MessageContent.forceUpdateAll();
    }

    async enabled(e) {
        if (Patcher.getPatchesByCaller('BD:ColoredText').length) return;
        this.intensitySetting.on('setting-updated', this._intensityUpdated);
        this.MessageContent = await ReactComponents.getComponent('MessageContent', { selector: WebpackModules.getSelector('container', 'containerCozy', 'containerCompact', 'edited') });
        MonkeyPatch('BD:ColoredText', this.MessageContent.component.prototype).after('render', this.injectColoredText);
        this.MessageContent.forceUpdateAll();
    }

    injectColoredText(thisObject, args, returnValue) {
        const ColorShader = WebpackModules.getModuleByName('ColorShader');
        const markup = Utils.findInReactTree(returnValue, m => m && m.props && m.props.className && m.props.className.includes('da-markup'));
        const roleColor = thisObject.props.message.colorString;
        if (markup && roleColor) markup.props.style = {color: ColorShader.lighten(roleColor, this.intensity)};
    }

    disabled(e) {
        Patcher.unpatchAll('BD:ColoredText');
        this.intensitySetting.off('setting-updated', this._intensityUpdated);
    }

}
