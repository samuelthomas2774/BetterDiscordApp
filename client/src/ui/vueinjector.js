/**
 * BetterDiscord VUE Injector Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Vue from './vue';

export default class {
    
    static inject(root, bdnode, components, template) {
        bdnode.appendTo(root);

        return new Vue({
            el: bdnode.element,
            components,
            template
        });
    }

}
