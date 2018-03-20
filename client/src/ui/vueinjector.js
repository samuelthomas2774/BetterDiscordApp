/**
 * BetterDiscord Vue Injector Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Vue from './vue';

export default class {

    static inject(root, bdnode, components, template, replaceRoot) {
        if(!replaceRoot) bdnode.appendTo(root);

        return new Vue({
            el: replaceRoot ? root : bdnode.element,
            components,
            template
        });
    }

    static _inject(root, options, bdnode) {
        if(bdnode) bdnode.appendTo(root);

        const vue = new Vue(options);

        vue.$mount(bdnode || root);
        return vue;
    }

}
