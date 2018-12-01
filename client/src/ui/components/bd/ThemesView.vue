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
    <SettingsWrapper headertext="Themes" :noscroller="true">
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

        <div class="bd-flex bd-flexCol bd-themesview">
            <div v-if="local" class="bd-flex bd-flexGrow bd-flexCol bd-themesContainer bd-localPh">
                <ScrollerWrap>
                    <ThemeCard v-for="theme in localThemes" :theme="theme" :key="theme.id" :data-theme-id="theme.id" @toggle-theme="toggleTheme(theme)" @reload-theme="reload => reloadTheme(theme, reload)" @show-settings="dont_clone => showSettings(theme, dont_clone)" @delete-theme="unload => deleteTheme(theme, unload)" />
                </ScrollerWrap>
            </div>
            <div v-else class="bd-onlinePh">
                <div class="bd-onlinePhHeader">
                    <div class="bd-searchHint">{{searchHint}}</div>
                    <div class="bd-fancySearch" :class="{'bd-disabled': loadingOnline, 'bd-active': loadingOnline || (onlineThemes && onlineThemes.docs)}">
                        <input type="text" class="bd-textInput" placeholder="Search" @keydown.enter="searchInput" @keyup.stop />
                    </div>
                    <div class="bd-searchSort">
                        <span>Sort by:</span>
                    </div>
                    <div v-if="loadingOnline" class="bd-spinnerContainer">
                        <div class="bd-spinner7"/>
                    </div>
                </div>
                <ScrollerWrap class="bd-onlinePhBody" v-if="!loadingOnline && onlineThemes" :scrollend="scrollend">
                    <RemoteCard v-if="onlineThemes && onlineThemes.docs" v-for="theme in onlineThemes.docs" :key="theme.id" :item="theme" />
                    <div v-if="loadingMore" class="bd-spinnerContainer">
                        <div class="bd-spinner7"/>
                    </div>
                </ScrollerWrap>
            </div>
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { ThemeManager, BdWebApi } from 'modules';
    import { Modals } from 'ui';
    import { ClientLogger as Logger } from 'common';
    import { MiRefresh, ScrollerWrap } from '../common';
    import SettingsWrapper from './SettingsWrapper.vue';
    import ThemeCard from './ThemeCard.vue';
    import RemoteCard from './RemoteCard.vue';
    import RefreshBtn from '../common/RefreshBtn.vue';

    export default {
        data() {
            return {
                ThemeManager,
                local: true,
                localThemes: ThemeManager.localThemes,
                onlineThemes: null,
                loadingOnline: false,
                loadingMore: false,
                searchHint: ''
            };
        },
        components: {
            SettingsWrapper, ThemeCard, RemoteCard,
            MiRefresh, ScrollerWrap,
            RefreshBtn
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            async showOnline() {
                this.local = false;
                if (this.loadingOnline || this.onlineThemes) return;
            },
            async refreshLocal() {
                await this.ThemeManager.refreshThemes();
            },
            async refreshOnline() {
                this.searchHint = '';
                if (this.loadingOnline || this.loadingMore) return;
                this.loadingOnline = true;
                try {
                    const getThemes = await BdWebApi.themes.get();
                    this.onlineThemes = getThemes;
                    if (!this.onlineThemes.docs) return;
                    this.searchHint = `${this.onlineThemes.pagination.total} Results`;
                } catch (err) {
                    Logger.err('ThemesView', err);
                } finally {
                    this.loadingOnline = false;
                }
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
            },
            searchInput(e) {
                if (this.loadingOnline || this.loadingMore) return;
                this.refreshOnline();
            },
            async scrollend(e) {
                if (this.loadingOnline || this.loadingMore) return;
                this.loadingMore = true;
                try {
                    const getThemes = await BdWebApi.themes.get();
                    this.onlineThemes.docs = [...this.onlineThemes.docs, ...getThemes.docs];
                } catch (err) {
                    Logger.err('ThemesView', err);
                } finally {
                    this.loadingMore = false;
                }
            }
        }
    }
</script>
