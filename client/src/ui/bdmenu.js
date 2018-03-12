/**
 * BetterDiscord Menu Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Utils } from 'common';

let items = 0;

const BdMenuItems = new class {

    constructor() {
        window.bdmenu = this;

        this.items = [];

        this.addSettingsSet('Internal', 'core', 'Core');
        this.addSettingsSet('Internal', 'ui', 'UI');
        this.addSettingsSet('Internal', 'emotes', 'Emotes');

        this.add({category: 'Internal', contentid: 'css', text: 'CSS Editor'});
        this.add({category: 'External', contentid: 'plugins', text: 'Plugins'});
        this.add({category: 'External', contentid: 'themes', text: 'Themes'});
    }

    add(item) {
        item.id = items++;
        item.contentid = item.contentid || (items++ + '');
        item.active = false;
        item.hidden = item.hidden || false;
        item._type = item._type || 'button';

        this.items.push(item);
        return item;
    }

    addSettingsSet(category, set, text) {
        return this.add({
            category, set,
            text: text || set.text
        });
    }

    addVueComponent(category, text, component) {
        return this.add({
            category, text, component
        });
    }

    remove(item) {
        Utils.removeFromArray(this.items, item);
    }

};

export { BdMenuItems };
