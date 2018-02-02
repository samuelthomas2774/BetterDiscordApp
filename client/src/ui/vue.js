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
    defaultContainer: 'bdtooltips',
    defaultClass: 'bd-tooltip',
    defaultTargetClass: 'bd-has-tooltip',
    defaultInnerSelector: '.bd-tooltip-inner',
    defaultTemplate: '<div class="bd-tooltip"><span class="bd-tooltip-inner"></span></div>',
    defaultBoundariesElement: DOM.getElement('#app-mount')
});

export default Vue;
