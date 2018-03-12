/**
 * BetterDiscord External Module Base
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Content from './content';

export default class ExtModule extends Content {

    constructor(internals) {
        super(internals);
        this.__require = window.require(this.paths.mainPath);
    }

    get type() { return 'module' }

}
