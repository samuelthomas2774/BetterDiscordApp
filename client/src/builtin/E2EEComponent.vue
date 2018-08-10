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
        <template v-if="error">
            <div class="bd-e2eeTaBtn bd-e2eeLock bd-error">
                <MiLock v-tooltip="'E2EE ERROR!'" />
            </div>
        </template>
        <template v-else-if="state === 'loading'">
            <div class="bd-e2eeTaBtn bd-e2eeLock bd-warn">
                <MiLock v-tooltip="'E2EE is loading'" />
            </div>
        </template>
        <template v-else>
            <div class="bd-e2eeTaBtn bd-e2eeLock bd-ok">
                <MiLock v-tooltip="'E2EE Ready!'" />
            </div>
        </template>
        <div class="bd-taDivider"></div>
    </div>
</template>

<script>
    import { MiLock } from '../ui/components/common/MaterialIcon';
    export default {
        components: { MiLock },
        data() {
            return {
                state: 'loading',
                error: null
            };
        },
        methods: {}
    }
</script>
