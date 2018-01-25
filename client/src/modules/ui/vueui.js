/**
 * BetterDiscord Client UI Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree. 
*/

const $ = require('jquery');
const Vue = require('vue').default;
const VTooltip = require('v-tooltip');

const BdSettingsWrapper = (require('./components/BdSettingsWrapper.vue')).default;
class UI {

    constructor() {
        $('body').append($('<bdbody/>')
            .append($('<div/>', {
            id: 'bd-settings'
        })).append($('<bdtooltips/>')));

        Vue.use(VTooltip, {
            defaultContainer: 'bdtooltips',
            defaultClass: 'bd-tooltip',
            defaultTargetClass: 'bd-has-tooltip',
            defaultInnerSelector: '.bd-tooltip-inner',
            defaultTemplate: '<div class="bd-tooltip"><span class="bd-tooltip-inner"></span></div>'
        });


         this.vueInstance = new Vue({
             el: '#bd-settings',
             template: '<BdSettingsWrapper/>',
             components: { BdSettingsWrapper }
         });
    }

}


module.exports = { UI }


