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
                <h3>Installed</h3>
                <RefreshBtn v-if="local" @click="refreshLocal"/>
            </div>
            <div class="bd-button" :class="{'bd-active': !local}" @click="showOnline">
                <h3>Browse</h3>
                <RefreshBtn v-if="!local" @click="refreshOnline" />
            </div>
        </div>

        <div class="bd-flex bd-flex-col bd-themesview">
            <div v-if="local" class="bd-flex bd-flex-grow bd-flex-col bd-themes-container bd-local-themes">
                <ThemeCard v-for="theme in localThemes" :theme="theme" :key="theme.id" :data-theme-id="theme.id" @toggle-theme="toggleTheme(theme)" @reload-theme="reload => reloadTheme(theme, reload)" @show-settings="dont_clone => showSettings(theme, dont_clone)" @delete-theme="unload => deleteTheme(theme, unload)" />
            </div>
            <div v-if="!local" class="bd-online-ph">
                <h3>Coming Soon</h3>
                <a href="https://v2.betterdiscord.net/themes" target="_new">Website Browser</a>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { ThemeManager } from 'modules';
    import { Modals } from 'ui';
    import { ClientLogger as Logger } from 'common';
    import { MiRefresh } from '../common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import ThemeCard from './ThemeCard.vue';
    import RefreshBtn from '../common/RefreshBtn.vue';

    export default {
        data() {
            return {
                ThemeManager,
                local: true,
                localThemes: ThemeManager.localThemes
            };
        },
        components: {
            SettingsWrapper, ThemeCard,
            MiRefresh,
            RefreshBtn
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            showOnline() {
                this.local = false;
            },
            async refreshLocal() {
                await this.ThemeManager.refreshThemes();
            },
            async refreshOnline() {
                // TODO
            },
            async toggleTheme(theme) {
                // TODO: display error if theme fails to enable/disable
                try {
                    await theme.enabled ? this.ThemeManager.disableTheme(theme) : this.ThemeManager.enableTheme(theme);
                } catch (err) {
                    Logger.err('ThemesView', [`Error ${enabled ? 'stopp' : 'start'}ing theme ${theme.name}:`, err]);
                }
            },
            async reloadTheme(theme, reload) {
                try {
                    await reload ? this.ThemeManager.reloadTheme(theme) : theme.recompile();
                } catch (err) {
                    Logger.err('ThemesView', [`Error ${reload ? 'reload' : 'recompil'}ing theme ${theme.name}:`, err]);
                }
            },
            async deleteTheme(theme, unload) {
                try {
                    await unload ? this.ThemeManager.unloadTheme(theme) : this.ThemeManager.deleteTheme(theme);
                } catch (err) {
                    Logger.err('ThemesView', [`Error ${unload ? 'unload' : 'delet'}ing theme ${theme.name}:`, err]);
                }
            },
            showSettings(theme, dont_clone) {
                return Modals.contentSettings(theme, null, {
                    dont_clone
                });
            }
        }
    }
</script>
