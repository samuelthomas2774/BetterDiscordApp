/**
 * BetterDiscord Themes View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Themes">
        <div class="bd-flex bd-flex-col bd-themesView">
            <div class="bd-tabbar">
                <div class="bd-button" :class="{'bd-active': local}" @click="showLocal">
                    <h3>Local</h3>
                    <div class="bd-material-button" @click="refreshLocal"><MiRefresh /></div>
                </div>
                <div class="bd-button" :class="{'bd-active': !local}" @click="showOnline">
                    <h3>Online</h3>
                    <div class="bd-material-button"><MiRefresh /></div>
                </div>
            </div>
            <div v-if="local" class="bd-flex bd-flex-grow bd-flex-col bd-themes-container bd-local-themes">
                <ThemeCard v-for="theme in localThemes" :theme="theme" :key="theme.id" :toggleTheme="toggleTheme" :reloadTheme="reloadTheme" :showSettings="showSettings" />
            </div>
            <div v-if="!local" class="bd-spinner-container">
                <div class="bd-spinner-2"></div>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { ThemeManager } from 'modules';
    import { Modals } from 'ui';
    import { SettingsWrapper } from './';
    import { MiRefresh } from '../common';
    import ThemeCard from './ThemeCard.vue';

    export default {
        data() {
            return {
                local: true,
                localThemes: ThemeManager.localThemes
            }
        },
        components: {
            SettingsWrapper, ThemeCard,
            MiRefresh
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            showOnline() {
                this.local = false;
            },
            refreshLocal() {
                (async () => {
                    await ThemeManager.refreshTheme();
                })();
            },
            toggleTheme(theme) {
                // TODO Display error if theme fails to enable/disable
                try {
                    if (theme.enabled) {
                        ThemeManager.disableTheme(theme);
                    } else {
                        ThemeManager.enableTheme(theme);
                    }
                } catch (err) {
                    console.log(err);
                }
            },
            reloadTheme(theme) {
                (async () => {
                    try {
                        await ThemeManager.reloadTheme(theme);
                        this.$forceUpdate();
                    } catch (err) {
                        console.log(err);
                    }
                })();
            },
            showSettings(theme) {
                return Modals.contentSettings(theme);
            }
        }
    }
</script>
