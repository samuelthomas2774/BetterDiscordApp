/**
 * BetterDiscord Reflection Resolver
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Module } from './modules';

class Resolved {

    constructor(module, ...classes) {
        this.module = Module.byProps(...classes);
        this.classes = classes;
    }

    get className() {
        return this.module && this.module[this.classes[0]] ? this.module[this.classes[0]].split(' ')[0] : this.classes[0];
    }

    get selector() {
        return `.${this.className}`;
    }

}

export default class Resolver {

    static resolve(...classes) {
        return new Resolved(Module.byProps(...classes), ...classes);
    }

    static async resolveAsync(...classes) {
        const module = await Module.waitForModuleByProps([...classes]);
        return new Resolved(module, ...classes);
    }

    /**
     * Searches for a class module and returns a class from it.
     * @param {String} base The first part of the class to find
     * @param {String} ...additional_classes Additional classes to look for to filter duplicate class modules
     * @return {String}
     */
    static getClassName(base, ...additional_classes) {
        const class_module = Module.byProps([base, ...additional_classes]);
        if (class_module && class_module[base]) return class_module[base].split(' ')[0];
    }
    static async waitForClassName(base, ...additional_classes) {
        const class_module = await Module.waitForModuleByProps([base, ...additional_classes]);
        if (class_module && class_module[base]) return class_module[base].split(' ')[0];
    }
    static getSelector(base, ...additional_classes) {
        const gcn = this.getClassName(base, ...additional_classes);
        if (gcn) return `.${gcn}`;
    }
}
