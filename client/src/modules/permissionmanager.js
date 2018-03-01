/**
 * BetterDiscord Permission Manager
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PermissionMap = {
    IDENTIFY: {
        HEADER: 'Access your account information',
        BODY: 'Allows :NAME: to read your account information(excluding user token)'
    },
    READ_MESSAGES: {
        HEADER: 'Read all messages',
        BODY: 'Allows :NAME: to read all messages accessible through your Discord account'
    },
    SEND_MESSAGES: {
        HEADER: 'Send messages',
        BODY: 'Allows :NAME: to send messages on your behalf'
    },
    DELETE_MESSAGES: {
        HEADER: 'Delete messages',
        BODY: 'Allows :NAME: to delete messages on your behalf'
    },
    EDIT_MESSAGES: {
        HEADER: 'Edit messages',
        BODY: 'Allows :NAME: to edit messages on your behalf'
    },
    JOIN_SERVERS: {
        HEADER: 'Join servers for you',
        BODY: 'Allows :NAME: to join servers on your behalf'
    }
}

export default class {

    static permissionText(permission) {
        return PermissionMap[permission];
    }

}
