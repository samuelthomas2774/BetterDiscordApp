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
    <div class="bd-e2eeTaContainer">
        <v-popover :popoverClass="['bd-popover', 'bd-e2eePopover', {'bd-e2eePopoverOver': popoutPositionSetting.value === 'over'}]"
            :trigger="popoutPositionSetting.value === 'over' && popoutTriggerSetting.value === 'hover' ? 'hover' : 'click'"
            :placement="popoutPositionSetting.value === 'over' ? 'top-start' : 'top'"
            :disabled="error && DiscordApi.currentChannel.type !== 'DM'">

            <div v-if="error" class="bd-e2eeTaBtn bd-e2eeLock bd-error">
                <MiLock v-tooltip="error" />
            </div>
            <div v-else-if="state === 'loading'" class="bd-e2eeTaBtn bd-e2eeLock bd-loading bd-warn">
                <MiLock v-tooltip="'Loading'" />
            </div>

            <div v-else-if="!E2EE.encryptNewMessages" class="bd-e2eeTaBtn bd-e2eeLock bd-warn">
                <MiLock v-tooltip="'New messages will not be encrypted.'" />
            </div>

            <div v-else class="bd-e2eeTaBtn bd-e2eeLock bd-ok">
                <MiLock v-tooltip="'Ready!'" />
            </div>

            <template slot="popover">
                <div @click="toggleEncrypt" :class="{'bd-warn': !E2EE.encryptNewMessages, 'bd-ok': E2EE.encryptNewMessages}"><MiLock v-tooltip="'Toggle Encryption'" /></div>
                <div v-close-popover @click="showUploadDialog" v-if="!error"><MiImagePlus v-tooltip="'Upload Encrypted Image'" /></div>
                <div v-close-popover @click="generatePublicKey" v-if="DiscordApi.currentChannel.type === 'DM'"><MiIcVpnKey v-tooltip="'Begin Key Exchange'" /></div>
            </template>
        </v-popover>
        <div class="bd-taDivider"></div>
    </div>
</template>

<script>
    import { Utils, FileUtils, ClientIPC } from 'common';
    import { E2EE } from 'builtin';
    import { Settings, DiscordApi, Reflection } from 'modules';
    import { Toasts } from 'ui';
    import { MiLock, MiImagePlus, MiIcVpnKey } from '../ui/components/common/MaterialIcon';

    export default {
        components: {
            MiLock, MiImagePlus, MiIcVpnKey
        },
        data() {
            return {
                E2EE,
                DiscordApi,
                state: 'loading',
                error: null,
                popoutPositionSetting: Settings.getSetting('security', 'e2ee-popout', 'position'),
                popoutTriggerSetting: Settings.getSetting('security', 'e2ee-popout', 'trigger')
            };
        },
        methods: {
            async showUploadDialog() {
                const dialogResult = await ClientIPC.send('bd-native-open', {properties: ['openFile']});
                if (!dialogResult || !dialogResult.length) return;

                const readFile = await FileUtils.readFileBuffer(dialogResult[0]);
                const FileActions = Reflection.module.byProps('makeFile');
                const Uploader = Reflection.module.byProps('instantBatchUpload');

                const img = await Utils.getImageFromBuffer(readFile);

                const canvas = document.createElement('canvas');
                canvas.height = img.height;
                canvas.width = img.width;
                const arrBuffer = await Utils.canvasToArrayBuffer(canvas);
                const encrypted = E2EE.encrypt(img.src.replace('data:;base64,', ''));
                const hmac = await E2EE.createHmac(encrypted);
                const encodedBytes = new TextEncoder().encode(encrypted + hmac);
                Uploader.upload(DiscordApi.currentChannel.id, FileActions.makeFile(new Uint8Array([...new Uint8Array(arrBuffer), ...encodedBytes]), 'bde2ee.png'));
            },
            toggleEncrypt() {
                const newState = !E2EE.encryptNewMessages;
                E2EE.encryptNewMessages = newState;
                if (!newState) {
                    Toasts.warning('New messages will not be encrypted');
                    return;
                }
                Toasts.success('New messages will be encrypted');
            },
            generatePublicKey() {
                const keyExchange = E2EE.createKeyExchange(DiscordApi.currentChannel.id);
                if (keyExchange === null) {
                    Toasts.warning('Key exchange for channel already in progress!');
                    return;
                }
                E2EE.preExchangeState = E2EE.encryptNewMessages;
                E2EE.encryptNewMessages = false; // Disable encrypting new messages so we won't encrypt public keys
                const publicKeyMessage = `\`\`\`\n-----BEGIN PUBLIC KEY-----\n${keyExchange}\n-----END PUBLIC KEY-----\n\`\`\``;
                Reflection.modules.DraftActions.saveDraft(DiscordApi.currentChannel.id, publicKeyMessage);
                Toasts.info('Key exchange started. Expires in 30 seconds');
            }
        },
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
