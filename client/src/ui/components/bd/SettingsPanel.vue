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
                    <div class="bd-settings-scheme" :class="{'bd-active': scheme.isActive(settings)}" @click="() => scheme.applyTo(settings)">
                        <div class="bd-settings-scheme-icon" :style="{'background-image': `url(&quot;${scheme.icon_url}&quot;)`}"></div>
                        <div class="bd-settings-scheme-name" v-if="scheme.name">{{ scheme.name }}</div>
                        <div class="bd-settings-scheme-hint" v-if="scheme.hint">{{ scheme.hint }}</div>
                    </div>
                </template>
            </div>
        </div>

        <div class="bd-settings-categories">
            <template v-for="category in settings.categories">
                <div class="bd-settings-category">
                    <div v-if="category.category === 'default' || !category.type">
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" />
                    </div>
                    <div class="bd-settings-static" v-else-if="category.type === 'static'">
                        <div class="bd-form-header">
                            <span class="bd-form-header-text">{{ category.category_name }}</span>
                        </div>
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" />
                    </div>
                    <Drawer v-else-if="category.type === 'drawer'" :label="category.category_name">
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" />
                    </Drawer>
                    <div v-else>
                        <Setting v-for="setting in category.settings" :key="setting.id" :setting="setting" />
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
        props: ['settings', 'schemes'],
        components: {
            Setting,
            Drawer
        }
    }
</script>
