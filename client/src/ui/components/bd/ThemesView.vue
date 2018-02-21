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
        <div class="bd-tabbar" slot="header">
            <div class="bd-button" :class="{'bd-active': local}" @click="showLocal">
                <h3>Local</h3>
                <div class="bd-material-button" v-if="local" @click="refreshLocal"><MiRefresh /></div>
            </div>
            <div class="bd-button" :class="{'bd-active': !local}" @click="showOnline">
                <h3>Online</h3>
                <div class="bd-material-button" v-if="!local" @click="refreshOnline"><MiRefresh /></div>
            </div>
        </div>

        <div class="bd-flex bd-flex-col bd-themesView">
            <div v-if="local" class="bd-flex bd-flex-grow bd-flex-col bd-themes-container bd-local-themes">
                <ThemeCard v-for="theme in localThemes" :theme="theme" :key="theme.id" :toggleTheme="() => toggleTheme(theme)" :reloadTheme="e => reloadTheme(theme, e.shiftKey)" :showSettings="() => showSettings(theme)" :deleteTheme="e => deleteTheme(theme, e.shiftKey)" />
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
            async refreshLocal() {
                await ThemeManager.refreshThemes();
            },
            async refreshOnline() {

            },
            async toggleTheme(theme) {
                // TODO Display error if theme fails to enable/disable
                try {
                    await theme.enabled ? ThemeManager.disableTheme(theme) : ThemeManager.enableTheme(theme);
                    this.$forceUpdate();
                } catch (err) {
                    console.log(err);
                }
            },
            async reloadTheme(theme, reload) {
                try {
                    if (reload) await ThemeManager.reloadTheme(theme);
                    else await theme.recompile();
                    this.$forceUpdate();
                } catch (err) {
                    console.log(err);
                }
            },
            async deleteTheme(theme, unload) {
                try {
                    if (unload) await ThemeManager.unloadTheme(theme);
                    else await ThemeManager.deleteTheme(theme);
                    this.$forceUpdate();
                } catch (err) {
                    console.error(err);
                }
            },
            showSettings(theme) {
                return Modals.contentSettings(theme);
            }
        }
    }
</script>
