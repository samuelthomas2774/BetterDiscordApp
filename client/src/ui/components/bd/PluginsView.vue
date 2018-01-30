/**
 * BetterDiscord Plugins View Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <SettingsWrapper headertext="Plugins">
        <div class="bd-flex bd-flex-col bd-pluginsView">
            <div class="bd-flex bd-tabheader">
                <div class="bd-flex-grow bd-button" :class="{'bd-active': local}" @click="showLocal">
                    <h3>Local</h3>
                    <div class="bd-material-button" @click="refreshLocal">
                        <refresh />
                    </div>
                </div>
                <div class="bd-flex-grow bd-button" :class="{'bd-active': !local}" @click="showOnline">
                    <h3>Online</h3>
                    <div class="bd-material-button">
                        <refresh />
                    </div>
                </div>
            </div>
            <div v-if="local" class="bd-flex bd-flex-grow bd-flex-col bd-plugins-container bd-local-plugins">
                <PluginCard v-for="plugin in localPlugins" :plugin="plugin" :key="plugin.id" :togglePlugin="togglePlugin" :reloadPlugin="reloadPlugin" :showSettings="showSettings" />
            </div>
            <div v-if="!local" class="bd-spinner-container">
                <div class="bd-spinner-2"></div>
            </div>
        </div>
        <div v-if="settingsOpen !== null" class="bd-backdrop" @click="settingsOpen = null"></div>
        <div v-if="settingsOpen !== null" class="bd-modal">
            <PluginSettingsModal :plugin="settingsOpen" />
        </div>
    </SettingsWrapper>
</template>

<script>
    // Imports
    import { PluginManager } from 'modules';
    import { SettingsWrapper } from './';
    import PluginCard from './PluginCard.vue';
    import Refresh from 'vue-material-design-icons/refresh.vue';

    export default {
        data() {
            return {
                local: true,
                pluginManager: PluginManager,
                settingsOpen: null
            }
        },
        components: {
            SettingsWrapper, PluginCard, Refresh
        },
        computed: {
            localPlugins() {
                return this.pluginManager.localPlugins;
            }
        },
        methods: {
            showLocal() {
                this.local = true;
            },
            showOnline() {
                this.local = false;
            },
            refreshLocal() { },
            togglePlugin() { },
            reloadPlugin() { },
            showSettings() { }
        }
    }

</script>
