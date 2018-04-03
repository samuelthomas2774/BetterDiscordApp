/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import DOM from 'dom';
import Vue from 'vue';
import VTooltip from 'v-tooltip';

Vue.use(VTooltip, {
    defaultContainer: 'bd-tooltips',
    defaultClass: 'bd-tooltip',
    defaultTargetClass: 'bd-has-tooltip',
    defaultArrowSelector: '.bd-tooltip-arrow',
    defaultInnerSelector: '.bd-tooltip-inner',
    defaultTemplate: '<div class="bd-tooltip"><div class="bd-tooltip-arrow"></div><span class="bd-tooltip-inner"></span></div>',
    defaultBoundariesElement: DOM.getElement('#app-mount'),
    popover: {
        defaultContainer: 'bd-tooltips',
        defaultClass: 'bd-popover',
        defaultWrapperClass: 'bd-popover-wrapper',
        defaultInnerClass: 'bd-popover-inner',
        defaultArrowClass: 'bd-popover-arrow',
        defaultBoundariesElement: DOM.getElement('#app-mount')
    }
});

export default Vue;
