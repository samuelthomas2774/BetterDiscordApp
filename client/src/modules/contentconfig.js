/**
 * BetterDiscord Content Config Utility
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/


export default class ContentConfig {

    constructor(data) {
        this.data = data;
    }

    map(cb) {
        return this.data.map(cb);
    }

    strip() {
        return this.map(cat => ({
            category: cat.category,
            settings: cat.settings.map(setting => ({
                 id: setting.id, value: setting.value
            }))
        }));
    }
    
}
