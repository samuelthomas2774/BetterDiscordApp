/*
 * BetterDiscord Context Menus
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export class BdContextMenu {

    /**
     * Show a context menu
     * @param {Object[]} grops Groups of items to show in context menu
     */
    static show(groups) {
        this.activeMenu.menu = { groups };
    }

    static get activeMenu() {
        return this._activeMenu || (this._activeMenu = { menu: null });
    }

}
