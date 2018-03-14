/**
 * BetterDiscord Filters
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export default class {

    static byProperties(props, selector) {
        return module => {
            const component = selector ? selector(module) : module;
            if (!component) return false;
            return props.every(property => component[property] !== undefined);
        };
    }

    static byPrototypeFields(fields, selector) {
        return module => {
            const component = selector ? selector(module) : module;
            if (!component) return false;
            if (!component.prototype) return false;
            return fields.every(field => component.prototype[field] !== undefined);
        };
    }

    static byCode(search, selector) {
        return module => {
            const method = selector ? selector(module) : module;
            if (!method) return false;
            return method.toString().search(search) !== -1;
        };
    }

    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    static combine(...filters) {
        return module => {
            return filters.every(filter => filter(module));
        };
    }

}
