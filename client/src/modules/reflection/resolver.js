/**
 * BetterDiscord Reflection Resolver
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Modules from './modules';

export class Resolver {

    /**
     * Searches for a class module and returns a class from it.
     * @param {String} base The first part of the class to find
     * @param {String} ...additional_classes Additional classes to look for to filter duplicate class modules
     * @return {String}
     */
    static getClassName(base, ...additional_classes) {
        const class_module = Modules.getModuleByProps([base, ...additional_classes]);
        if (class_module && class_module[base]) return class_module[base].split(' ')[0];
    }
    static async waitForClassName(base, ...additional_classes) {
        const class_module = await Modules.waitForModuleByProps([base, ...additional_classes]);
        if (class_module && class_module[base]) return class_module[base].split(' ')[0];
    }
    static getSelector(base, ...additional_classes) {
        const gcn = this.getClassName(base, ...additional_classes);
        if (gcn) return `.${gcn}`;
    }
}
