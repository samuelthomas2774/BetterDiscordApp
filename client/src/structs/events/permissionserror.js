/**
 * BetterDiscord Permissions Error Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ErrorEvent from './error';

export class PermissionsError extends ErrorEvent {
    constructor(message) {
        super(message);
        this.name = 'PermissionsError';
    }
}

export class InsufficientPermissions extends PermissionsError {
    constructor(message) {
        super(`Missing Permission — ${message}`);
        this.name = 'InsufficientPermissions';
    }
}
