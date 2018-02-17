/**
 * BetterDiscord Settings Panel Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-settings-panel">
        <div class="bd-settings-schemes" v-if="schemes && schemes.length">
            <div class="bd-settings-schemes-container">
                <template v-for="scheme in schemes">
                    <div class="bd-settings-scheme" :class="{'bd-active': checkSchemeActive(scheme)}" @click="() => setActiveScheme(scheme)">
                        <div class="bd-settings-scheme-icon" :style="{'background-image': `url(&quot;${scheme.icon_url}&quot;)`}"></div>
                        <div class="bd-settings-scheme-name" v-if="scheme.name">{{ scheme.name }}</div>
                        <div class="bd-settings-scheme-hint" v-if="scheme.hint">{{ scheme.hint }}</div>
                    </div>
                </template>
            </div>
        </div>

        <div class="bd-settings-categories">
            <template v-for="category in settings">
                <div class="bd-settings-category">
                    <div v-if="category.category === 'default' || !category.type">
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="v => settingChange(category, setting, v)" />
                    </div>
                    <div class="bd-settings-static" v-else-if="category.type === 'static'">
                        <div class="bd-form-header">
                            <span class="bd-form-header-text">{{ category.category_name }}</span>
                        </div>
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="v => settingChange(category, setting, v)" />
                    </div>
                    <Drawer v-else-if="category.type === 'drawer'" :label="category.category_name">
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="v => settingChange(category, setting, v)" />
                    </Drawer>
                    <div v-else>
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="v => settingChange(category, setting, v)" />
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    // Imports
    import { Utils } from 'common';
    import Setting from './setting/Setting.vue';
    import Drawer from '../common/Drawer.vue';

    export default {
        props: ['settings', 'schemes', 'change'],
        components: {
            Setting,
            Drawer
        },
        methods: {
            checkSchemeActive(scheme) {
                for (let schemeCategory of scheme.settings) {
                    const category = this.settings.find(c => c.category === schemeCategory.category);
                    if (!category) return false;

                    for (let schemeSetting of schemeCategory.settings) {
                        const setting = category.settings.find(s => s.id === schemeSetting.id);
                        if (!setting || !Utils.compare(setting.value, schemeSetting.value)) return false;
                    }
                }

                return true;
            },
            setActiveScheme(scheme) {
                for (let schemeCategory of scheme.settings) {
                    const category = this.settings.find(c => c.category === schemeCategory.category);
                    if (!category) {
                        console.err(`Category ${schemeCategory.category} does not exist`);
                        continue;
                    }

                    for (let schemeSetting of schemeCategory.settings) {
                        const setting = category.settings.find(s => s.id === schemeSetting.id);
                        if (!setting) {
                            console.err(`Setting ${schemeCategory.category}/${schemeSetting.id} does not exist`);
                            continue;
                        }

                        this.change(category.category, setting.id, schemeSetting.value);
                    }
                }
            },
            settingChange(category, setting, value) {
                if (setting.disabled) return;
                this.change(category.category, setting.id, value);
            }
        }
    }
</script>
