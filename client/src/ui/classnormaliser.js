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

const randClass = new RegExp(`^(?!da-)((?:[A-Za-z]|[0-9]|-)+)-(?:[A-Za-z]|[0-9]|-|_){6}$`);

export default class ClassNormaliser extends Module {

    init() {
        this.patchClassModules(WebpackModules.getModule(this.moduleFilter.bind(this), false));
    }

    patchClassModules(modules) {
        for (let module of modules) {
            this.patchClassModule('da', module);
        }
    }

    shouldIgnore(value) {
        if (!isNaN(value)) return true;
        if (value.endsWith('px') || value.endsWith('ch') || value.endsWith('em') || value.endsWith('ms')) return true;
        if (value.startsWith('rgba')) return true;
        if (value.includes('calc(')) return true;
        return false;
    }

    moduleFilter(module) {
        if (typeof module !== 'object' || Array.isArray(module)) return false;
        if (module.__esModule) return false;
        if (!Object.keys(module).length) return false;
        for (let baseClassName in module) {
            const value = module[baseClassName];
            if (typeof value !== 'string') return false;
            if (this.shouldIgnore(value)) continue;
            if (value.split('-').length === 1) return false;
            if (!randClass.test(value.split(' ')[0])) return false;
        }

        return true;
    }

    patchClassModule(componentName, classNames) {
        for (let baseClassName in classNames) {
            const value = classNames[baseClassName];
            if (this.shouldIgnore(value)) continue;
            const classList = value.split(' ');
            for (let normalClass of classList) {
                const match = normalClass.match(randClass)[1];
                if (!match) continue; // Shouldn't ever happen since they passed the moduleFilter, but you never know
                const camelCase = match.split('-').map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join('');
                classNames[baseClassName] += ` ${componentName}-${camelCase}`;
            }
        }
    }

}
