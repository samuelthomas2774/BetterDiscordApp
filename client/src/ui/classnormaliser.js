/**
 * BetterDiscord Class Normaliser
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Module, WebpackModules } from 'modules';

export default class ClassNormaliser extends Module {

    init() {
        this.patchClassModules(WebpackModules.getModule(this.moduleFilter, false));
    }

    patchClassModules(modules) {
        for (let module of modules) {
            this.patchClassModule('da', module);
        }
    }

    moduleFilter(module) {
        if (typeof module !== 'object' || Array.isArray(module)) return false;
        if (Array.isArray(module)) return false;
        if (module.__esModule) return false;
        if (!Object.keys(module).length) return false;
        for (let baseClassName in module) {
            if (typeof module[baseClassName] !== 'string') return false;
            if (module[baseClassName].split('-').length === 1) return false;
            const alphaNumeric = module[baseClassName].split(/-(.+)/)[1].split(' ')[0];
            if (alphaNumeric.length !== 6) return false;
        }

        return true;
    }

    patchClassModule(componentName, classNames) {
        for (let baseClassName in classNames) {
            const normalised = baseClassName.split('-')[0].replace(/[A-Z]/g, m => `-${m}`).toLowerCase();
            classNames[baseClassName] += ` ${componentName}-${normalised}`;
        }
    }

}
