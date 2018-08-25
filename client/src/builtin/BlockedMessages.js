/**
 * BetterDiscord Blocked Messages Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import { Reflection } from 'modules';

export default new class BlockedMessages extends BuiltinModule {

    /* Getters */
    get moduleName() { return 'BlockedMessages' }

    get settingPath() { return ['ui', 'default', 'blocked-messages'] }

    async enabled(e) {
        const MessageListComponents = Reflection.module.byProps('BlockedMessageGroup');
        MessageListComponents.OriginalBlockedMessageGroup = MessageListComponents.BlockedMessageGroup;
        MessageListComponents.BlockedMessageGroup = () => { return null; };
        this.cancelBlockedMessages = () => {
            MessageListComponents.BlockedMessageGroup = MessageListComponents.OriginalBlockedMessageGroup;
            delete MessageListComponents.OriginalBlockedMessageGroup;
        }
    }

    disabled(e) {
        if (this.cancelBlockedMessages) this.cancelBlockedMessages();
    }

    /* Methods */
    static isBlocked(id) {
        const { RelationshipStore } = Reflection.modules;
        return RelationshipStore.isBlocked(id);
    }

    /* Patches */
    applyPatches() {
        if (this.patches.length) return;
        const { MessageActions } = Reflection.modules;
        this.patch(MessageActions, 'receiveMessage', this.processMessage, 'instead');
    }

    /**
     * Ignore blocked messages completely
     */
    processMessage(that, args, originalFunction) {
        if (args[1] && args[1].author && args[1].author.id && BlockedMessages.isBlocked(args[1].author.id)) return;
        return originalFunction(...args);
    }

}
