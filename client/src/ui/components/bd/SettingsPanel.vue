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
    <div>
        <template v-for="category in settings">
            <div v-if="category.category === 'default' || !category.type">
                <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
            </div>
            <div v-else-if="category.type === 'static'">
                <div class="bd-form-header">
                    <span class="bd-form-header-text">{{category.category}} static with header</span>
                </div>
                <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
            </div>
            <Drawer v-else-if="category.type === 'drawer'" :label="category.category">
                <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
            </Drawer>
            <div v-else>
                <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" :change="settingChange" />
            </div>
        </template>
    </div>
</template>

<script>
    // Imports
    import Setting from './setting/Setting.vue';
    import Drawer from '../common/Drawer.vue';

    export default {
        props: ['settings', 'change'],
        components: {
            Setting,
            Drawer
        },
        methods: {
            settingChange(setting_id, value) {
                for (let category of this.settings) {
                    let setting = category.settings.find(s => s.id === setting_id);
                    if (!setting) continue;

                    this.change(category.category, setting_id, value);
                }

                this.$forceUpdate();
            }
        }
    }
</script>
