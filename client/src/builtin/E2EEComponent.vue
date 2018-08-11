/**
 * BetterDiscord E2EE Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-e2eeTaContainer" @contextmenu.prevent="location.pathname.match(/\/channels\/@me\/\d+/) && $refs.ee2eLockContextMenu.open()">
        <div v-if="error" class="bd-e2eeTaBtn bd-e2eeLock bd-error">
            <MiLock v-tooltip="error" />
        </div>
        <div v-else-if="state === 'loading'" class="bd-e2eeTaBtn bd-e2eeLock bd-loading bd-warn">
            <MiLock v-tooltip="'Loading'" />
        </div>
        <div v-else-if="!E2EE.encryptNewMessages" class="bd-e2eeTaBtn bd-e2eeLock bd-warn" @click="E2EE.encryptNewMessages = true">
            <MiLock v-tooltip="'New messages will not be encrypted.'" />
        </div>
        <div v-else class="bd-e2eeTaBtn bd-e2eeLock bd-ok" @click="E2EE.encryptNewMessages = false">
            <MiLock v-tooltip="'Ready!'" />
        </div>

        <div class="bd-taDivider"></div>
        <context-menu id="bd-e2eeLockContextMenu" class="bd-e2eeLockContextMenu" ref="ee2eLockContextMenu" v-if="location.pathname.match(/\/channels\/@me\/\d+/)">
            <li class="bd-e2eeLockContextMenuOption" @click="generatePublicKey()">Generate Public Key</li>
            <li class="bd-e2eeLockContextMenuOption" @click="computeSharedSecret()">Receive Public Key</li>
        </context-menu>
    </div>
</template>

<script>
    import { E2EE } from 'builtin';
    import { DiscordApi } from 'modules';
    import { MiLock } from '../ui/components/common/MaterialIcon';
    import contextMenu from 'vue-context-menu';
    import { clipboard } from 'electron';
    import { Toasts } from 'ui';

    function generatePublicKey() {
        const dmChannelID = location.pathname.split("/")[3];
        const publicKeyMessage = `My public key is: \`${E2EE.createKeyExchange(dmChannelID)}\`. Please give me your public key if you haven't done so and add my public key by pasting it in the chat textbox, right clicking the lock icon, and selecting \`Receive Public Key\`.`;
        const chatInput = document.getElementsByClassName('da-textArea')[0];
        chatInput.value = publicKeyMessage;
        const evt = { currentTarget: chatInput };
        chatInput[Object.keys(chatInput).find(k => k.startsWith('__reactEventHandlers'))].onChange.call(chatInput, evt);
    }

    function computeSharedSecret() {
        try {
          const dmChannelID = location.pathname.split("/")[3];
          const chatInput = document.getElementsByClassName('da-textArea')[0];
          const otherPublicKey = chatInput.value;
          const secret = E2EE.computeSecret(dmChannelID, otherPublicKey);
          E2EE.setKey(dmChannelID, secret);
          chatInput.value = "";
          const evt = { currentTarget: chatInput };
          chatInput[Object.keys(chatInput).find(k => k.startsWith('__reactEventHandlers'))].onChange.call(chatInput, evt);
          Toasts.success("Encryption key has been set for this DM channel.");
        } catch (e) {
          Toasts.error("Invalid public key. Please set up a new key exchange.");
          console.error(e);
        }
    }

    export default {
        components: { MiLock, contextMenu },
        data() {
            return {
                E2EE,
                state: 'loading',
                error: null,
                location: window.location
            };
        },
        methods: { generatePublicKey, computeSharedSecret },
        mounted() {
            if (!E2EE.master) {
                this.error = 'No master key set!';
                return;
            }
            const haveKey = E2EE.getKey(DiscordApi.currentChannel.id);
            if (!haveKey) {
                this.error = 'No key for channel!';
                return;
            }
            this.state = 'OK';
            this.error = null;
        }
    }
</script>
