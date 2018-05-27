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
            <div v-if="developer" v-tooltip="'BetterDiscord Developer'" class="bd-profile-badge bd-profile-badge-developer" @click="click"></div>
            <div v-else-if="webdev" v-tooltip="'BetterDiscord Web Developer'" class="bd-profile-badge bd-profile-badge-developer" @click="click"></div>
            <div v-else-if="contributor" v-tooltip="'BetterDiscord Contributor'" class="bd-profile-badge bd-profile-badge-contributor" @click="click"></div>
        </div>
    </div>
</template>

<script>
    // Imports
    import { shell } from 'electron';

    export default {
        props: ['webdev', 'developer', 'contributor'],
        methods: {
            click() {
                if (this.developer) return shell.openExternal('https://github.com/JsSucks/BetterDiscordApp');
                if (this.webdev) return shell.openExternal('https://betterdiscord.net');
                if (this.contributor) return shell.openExternal('https://github.com/JsSucks/BetterDiscordApp/graphs/contributors');
            }
        }
    }
</script>
