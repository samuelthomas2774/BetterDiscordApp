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
import { Patcher, MonkeyPatch, Reflection, ReactComponents } from 'modules';

export default new class BlockedMessages extends BuiltinModule {

    get settingPath() {
        return ['ui', 'default', 'blocked-messages'];
    }

    static isBlocked(id) {
        const { RelationshipStore } = Reflection.modules;
        return RelationshipStore.isBlocked(id);
    }

    async enabled(e) {
        if (Patcher.getPatchesByCaller('BD:BlockedMessages').length) return;
        const { MessageActions } = Reflection.modules;
        MonkeyPatch('BD:BlockedMessages', MessageActions).instead('receiveMessage', this.processMessage);

        const MessageListComponents = Reflection.module.byProps('BlockedMessageGroup');
        MessageListComponents.OriginalBlockedMessageGroup = MessageListComponents.BlockedMessageGroup;
        MessageListComponents.BlockedMessageGroup = () => {return null;};
        this.cancelBlockedMessages = () => {
            MessageListComponents.BlockedMessageGroup = MessageListComponents.OriginalBlockedMessageGroup;
            delete MessageListComponents.OriginalBlockedMessageGroup;
        }
    }

    processMessage(thisObject, args, originalFunction) {
        if (args[1] && args[1].author && args[1].author.id && BlockedMessages.isBlocked(args[1].author.id)) return;
        return originalFunction(...args);
    }

    disabled(e) {
        Patcher.unpatchAll('BD:BlockedMessages');
        if (this.cancelBlockedMessages) this.cancelBlockedMessages();
    }

}
