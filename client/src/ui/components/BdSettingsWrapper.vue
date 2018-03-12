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
        <div class="bd-settings-button" :class="{'bd-active': active, 'bd-animating': animating}" @click="buttonClick">
            <div v-if="error" v-tooltip.right="'Error starting BetterDiscord'" class="bd-settings-button-btn bd-error"></div>
            <div v-else-if="!loaded" v-tooltip.right="'Starting BetterDiscord...'" class="bd-settings-button-btn bd-loading"></div>
            <div v-else-if="updating === 0" v-tooltip.right="'Checking for updates'" class="bd-settings-button-btn bd-loading"></div>
            <div v-else-if="updating === 2" v-tooltip.right="'Updates available!'" class="bd-settings-button-btn bd-updates"></div>
            <div v-else class="bd-settings-button-btn" :class="[{'bd-loading': !loaded}]"></div>
        </div>
        <BdSettings v-if="loaded" ref="settings" :active="active" :close="hideSettings" />
    </div>
</template>
<script>
    // Imports
    import { Events, Settings } from 'modules';
    import { Modals } from 'ui';
    import { ErrorEvent } from 'structs';
    import { ClientLogger as Logger } from 'common';
    import BdSettings from './BdSettings.vue';

    export default {
        props: ['error'],
        data() {
            return {
                loaded: false,
                updating: false,
                active: false,
                animating: false,
                timeout: null,
                platform: global.process.platform
            };
        },
        components: {
            BdSettings
        },
        methods: {
            showSettings() { this.active = true },
            hideSettings() { this.active = false },
            toggleSettings() { this.active = !this.active },
            buttonClick(e) {
                if (this.active) return;

                if (this.error) {
                    Modals.error({
                        header: `BetterDiscord failed to start`,
                        module: 'main',
                        type: 'err',
                        content: [
                            new ErrorEvent({
                                module: 'main',
                                message: this.error.message,
                                err: this.error
                            })
                        ]
                    });
                } else if (this.loaded) {
                    this.showSettings();
                }
            },
            keyupListener(e) {
                if (Modals.stack.length || !this.active || e.which !== 27) return;
                if (this.$refs.settings.activeIndex !== -1) this.$refs.settings.closeContent();
                else this.hideSettings();
                e.stopImmediatePropagation();
            }
        },
        watch: {
            active(active) {
                if (active && !this.loaded || this.error)
                    return this.active = false;

                this.animating = true;
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.animating = false;
                    this.timeout = null;
                }, 400);
            }
        },
        created() {
            Events.on('ready', e => this.loaded = true);
            Events.on('update-check-start', e => this.updating = 0);
            Events.on('update-check-end', e => this.updating = 1);
            Events.on('updates-available', e => this.updating = 2);
            window.addEventListener('keyup', this.keyupListener);

            const menuKeybind = Settings.getSetting('core', 'default', 'menu-keybind');
            menuKeybind.on('keybind-activated', () => this.active = !this.active);
        },
        destroyed() {
            window.removeEventListener('keyup', this.keyupListener);
        }
    }
</script>
