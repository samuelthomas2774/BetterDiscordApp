/**
 * BetterDiscord BD Badge Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-profile-badges-wrap">
        <div class="bd-profile-badges">
            <div v-if="developer" class="bd-profile-badge bd-profile-badge-developer"></div>
            <div v-id="contributor" class="bd-profile-badge bd-profile-badge-contributor"></div>
        </div>
    </div>
</template>
<script>
    // Imports
    import { shell } from 'electron';

    export default {
        props: ['developer', 'contributor'],
        methods: {
            onClick() {
                if (this.developer) return shell.openExternal('https://github.com/JsSucks/BetterDiscordApp');
                if (this.contributor) return shell.openExternal('https://github.com/JsSucks/BetterDiscordApp/graphs/contributors');
            }
        }
    }
</script>
