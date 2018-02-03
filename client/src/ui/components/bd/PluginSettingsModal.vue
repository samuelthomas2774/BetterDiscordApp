/**
 * BetterDiscord Plugin Settings Modal Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div>
        <div class="bd-backdrop" @click="attemptToClose"></div>
        <Modal :headerText="plugin.name + ' Settings'" :close="attemptToClose">
            <div slot="body" class="bd-plugin-settings-body">

                <template v-for="category in categories">
                    <template v-if="category === 'default'">
                        <PluginSetting v-for="setting in configCache" v-if="!setting.category || setting.category === 'default'" :key="setting.id" :setting="setting" :change="settingChange" />
                    </template>
                    <div v-else class="bd-category-container">
                        <span>{{category}}</span>
                        <PluginSetting v-for="setting in configCache" v-if="setting.category === category" :key="setting.id" :setting="setting" :change="settingChange" />
                    </div>
                </template>

            </div>
            <div slot="footer" class="bd-footer-alert" :class ="{'bd-active': changed, 'bd-warn': warnclose}">
                <div class="bd-footer-alert-text">Unsaved changes</div>
                <div class="bd-button bd-reset-button bd-tp" @click="resetSettings">Reset</div>
                <div class="bd-button bd-ok" @click="saveSettings">Save Changes</div>
            </div>
        </Modal>
    </div>
</template>
<script>
    // Imports
    import { Modal } from '../common';
    import PluginSetting from './pluginsetting/PluginSetting.vue';

    export default {
        props: ['plugin','close'],
        data() {
            return {
                changed: false,
                warnclose: false,
                configCache: [],
                categories: ['default']
            }
        },
        components: {
            Modal,
            PluginSetting
        },
        methods: {
            checkForChanges() {
                for (let cachedSetting of this.configCache) {
                    if (this.plugin.pluginConfig.find(s => s.id === cachedSetting.id && s.value !== cachedSetting.value)) {
                        return true;
                    }
                }
                return false;
            },
            textInputKd(settingId) {
            },
            settingChange(settingId, newValue) {
                this.configCache.find(s => s.id === settingId).value = newValue;
                this.changed = this.checkForChanges();
            },
            saveSettings() {
                this.plugin.saveSettings(this.configCache);
                this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
                this.changed = false;
            },
            resetSettings() {
                this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
                this.changed = false;
            },
            attemptToClose() {
                if (!this.changed) return this.close();
                this.warnclose = true;
                setTimeout(() => {
                    this.warnclose = false;
                }, 400);
            }
        },
        beforeMount() {
            this.configCache = JSON.parse(JSON.stringify(this.plugin.pluginConfig));
            this.configCache.forEach(s => {
                if (!s.category || s.category === 'default') return;
                if (this.categories.includes(s.category)) return;
                this.categories.push(s.category);
            });
            this.changed = this.checkForChanges();
        }
    }
</script>
