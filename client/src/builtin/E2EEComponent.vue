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
    </div>
</template>

<script>
    import { E2EE } from 'builtin';
    import { DiscordApi } from 'modules';
    import { MiLock } from '../ui/components/common/MaterialIcon';

    export default {
        components: { MiLock },
        data() {
            return {
                E2EE,
                state: 'loading',
                error: null
            };
        },
        methods: {},
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
