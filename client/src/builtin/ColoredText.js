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
import { Patcher, MonkeyPatch, WebpackModules, ReactComponents } from 'modules';

export default new class ColoredText extends BuiltinModule {

    get settingPath() {
        return ['ui', 'default', 'colored-text'];
    }

    async enabled(e) {
        if (Patcher.getPatchesByCaller('BD:ColoredText').length) return;
        const MessageContent = await ReactComponents.getComponent('MessageContent', { selector: WebpackModules.getSelector('container', 'containerCozy', 'containerCompact', 'edited') });
        MonkeyPatch('BD:ColoredText', MessageContent.component.prototype).after('render', this.injectColoredText);
        MessageContent.forceUpdateAll();
    }

    injectColoredText(thisObject, args, returnValue) {
        const markup = Utils.findInReactTree(returnValue, m => m && m.props && m.props.className && m.props.className.includes('da-markup'));
        const roleColor = thisObject.props.message.colorString;
        if (markup && roleColor) markup.props.style = {color: roleColor};
    }

    disabled(e) {
        Patcher.unpatchAll('BD:ColoredText');
    }

}
