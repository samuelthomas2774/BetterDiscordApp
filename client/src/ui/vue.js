/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Vue from 'vue';
import VTooltip from 'v-tooltip';
import DOM from './dom';
import VueInjector from './vueinjector';
import { BdContextMenu } from './contextmenus';

Vue.use(VTooltip, {
    defaultContainer: 'bd-tooltips',
    defaultClass: 'bd-tooltip',
    defaultTargetClass: 'bd-hasTooltip',
    defaultArrowSelector: '.bd-tooltipArrow',
    defaultInnerSelector: '.bd-tooltipInner',
    defaultTemplate: '<div class="bd-tooltip"><div class="bd-tooltipArrow"></div><span class="bd-tooltipInner"></span></div>',
    defaultBoundariesElement: DOM.getElement('#app-mount'),
    popover: {
        defaultContainer: 'bd-tooltips',
        defaultClass: 'bd-popover',
        defaultWrapperClass: 'bd-popoverWrapper',
        defaultInnerClass: 'bd-popoverInner',
        defaultArrowClass: 'bd-popoverArrow',
        defaultBoundariesElement: DOM.getElement('#app-mount'),
        defaultPopperOptions: {
            modifiers: {
                computeStyle: {
                    gpuAcceleration: false
                }
            }
        }
    },
    defaultPopperOptions: {
        modifiers: {
            computeStyle: {
                gpuAcceleration: false
            }
        }
    }
});

Vue.use(VueInjector);
Vue.use(BdContextMenu);

export default Vue;
