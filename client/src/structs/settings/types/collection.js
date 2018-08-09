/**
 * BetterDiscord Collection Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Utils } from 'common';
import ArraySetting from './array';
import Setting from '../setting';

export default class CollectionSetting extends ArraySetting {

    constructor(args, ...merge) {
        // The ArraySetting constructor will call createItem which requires this to be set
        if (!(args.setting instanceof Setting)) args.setting = new Setting(args.setting || {type: args.subtype});

        super(args, ...merge);
    }

    get setting() {
        return this.args.setting;
    }

    /**
     * Creates a new setting for this collection setting.
     * @param {Setting} item Values to merge into the new setting (optional)
     * @return {Setting} The new set
     */
    createItem(item) {
        if (item instanceof Setting)
            return item;

        const merge = [...arguments].filter(a => a);
        const setting = this.setting.clone(...merge);
        setting.args.id = item ? item.args ? item.args.id : item.id : Math.random();

        setting.setSaved();
        setting.on('settings-updated', async event => {
            await this.emit('item-updated', { item: setting, event, updatedSettings: event.updatedSettings });
            if (event.args.updating_array !== this) await this.updateValue();
        });
        return setting;
    }

}
