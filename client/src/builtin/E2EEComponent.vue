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
        <div class="bd-e2eeTaBtn bd-e2eeLock bd-error">
            <MiLock v-tooltip="'E2EE'" />
        </div>
        <div class="bd-taDivider"></div>
    </div>
</template>

<script>
    import { MiLock } from '../ui/components/common/MaterialIcon';
    export default {
        components: { MiLock },
        data() {
            return {};
        },
        methods: {}
    }
</script>
