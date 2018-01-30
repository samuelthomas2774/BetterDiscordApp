/**
 * BetterDiscord Client Core
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { DOM, BdUI } from 'ui';
import BdCss from './styles/index.scss';
import { Events, CssEditor, Globals } from 'modules';

class BetterDiscord {
    constructor() {
        window.DOM = DOM;
        window.cssEditorTest = CssEditor;
        DOM.injectStyle(BdCss, 'bdmain');
        Events.on('global-ready', this.globalReady.bind(this));
    }

    globalReady() {
        this.vueInstance = BdUI.injectUi();
    }
}

if (window.BetterDiscord) {
    Logger.log('main', 'Attempting to inject again?');
} else {
    let bdInstance = new BetterDiscord();
   // window.BetterDiscord = { 'vendor': Vendor };
}
