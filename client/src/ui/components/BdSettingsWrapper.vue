/**
 * BetterDiscord Settings Wrapper Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settings-wrapper" :class="[{active: active}, 'platform-' + this.platform]">
        <div class="bd-settings-button" :class="{active: active}" @click="showSettings">
            <div class="bd-settings-button-btn" :class="[{'bd-loading': !loaded}]"></div>
        </div>
        <BdSettings :active="active" :close="hideSettings" />
    </div>
</template>
<script>
    // Imports
    import { Events } from 'modules';
    import BdSettings from './BdSettings.vue';
    import { ClientIPC } from 'common';

    export default {
        data() {
            return {
                loaded: false,
                active: false,
                platform: global.process.platform
            }
        },
        components: {
            BdSettings
        },
        methods: {
            showSettings() {
                if (!this.loaded) return;
                this.active = true;
            },
            hideSettings() { this.active = false },
            toggleSettings() { this.active = !this.active },
            keyupListener(e) {
                if (this.active && e.which === 27) return this.hideSettings();
                if (!e.metaKey && !e.ctrlKey || e.key !== 'b') return;
                this.toggleSettings();
                e.stopImmediatePropagation();
            }
        },
        created() {
            Events.on('ready', e => this.loaded = true);
            window.addEventListener('keyup', this.keyupListener);
            ClientIPC.on('bd-toggle-menu', this.toggleSettings);
            ClientIPC.on('bd-show-menu', this.showSettings);
            ClientIPC.on('bd-hide-menu', this.hideSettings);
        },
        destroyed() {
            window.removeEventListener('keyup', this.keyupListener);
            ClientIPC.off('bd-toggle-menu', this.toggleSettings);
            ClientIPC.off('bd-show-menu', this.showSettings);
            ClientIPC.off('bd-hide-menu', this.hideSettings);
        }
    }
</script>
