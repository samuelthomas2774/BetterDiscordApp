/**
 * BetterDiscord Custom Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-customsetting" :class="{'bd-form-customsetting-debug': setting.debug}">
        <component :is="component" :setting="setting" :change="change"></component>
        <Drawer class="bd-form-customsetting-value" label="Custom setting data" v-if="setting.debug">
            <pre class="bd-pre-wrap"><div class="bd-pre">{{ JSON.stringify(setting, null, 4) }}</div></pre>
        </Drawer>
    </div>
</template>

<script>
    import { PluginManager } from 'modules';
    import SettingsPanel from '../SettingsPanel.vue';
    import Drawer from '../../common/Drawer.vue';
    import path from 'path';

    export default {
        props: ['setting', 'change'],
        components: {
            Drawer
        },
        computed: {
            component() {
                if (typeof this.setting.file === 'string') {
                    const component = window.require(path.join(this.setting.path, this.setting.file));
                    return this.setting.component ? component[this.setting.component] : component.default ? component.default : component;
                }
                if (typeof this.setting.function === 'string') {
                    const plugin = PluginManager.getPluginByPath(this.setting.path);
                    if (!plugin) return;
                    const component = plugin[this.setting.function](this.setting, this.change);
                    if (component instanceof HTMLElement)
                        return this.componentFromHTMLElement(component, this.setting, this.change);
                    return component;
                }
                if (typeof this.setting.component === 'string') {
                    const plugin = PluginManager.getPluginByPath(this.setting.path);
                    if (!plugin) return;
                    const component = plugin[this.setting.component];
                    return component;
                }
                if (typeof this.setting.component === 'object') {
                    return this.setting.component;
                }
            }
        },
        methods: {
            componentFromHTMLElement(htmlelement, setting, change) {
                return {
                    template: '<div></div>',
                    props: ['setting', 'change'],
                    mounted() {
                        this.$el.appendChild(htmlelement);
                    }
                };
            }
        }
    }
</script>
