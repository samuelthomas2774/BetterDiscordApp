/**
 * BetterDiscord Plugin Setting Dropdown Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-setting-switch"> 
        <div class="bd-title">
            <h3>{{setting.text}}</h3>
            <div class="bd-dropdown">
                <div class="bd-dropdown-current" @click="expanded = true">{{getOptionText(setting.value)}}<span class="bd-dropdown-arrow"></span></div>
                <div class="bd-dropdown-options bd-flex bd-flex-col" ref="options" v-if="expanded">
                    <div v-for="option in setting.options" @click="selectOption(setting.id, option.value)">{{option.text}}</div>
                </div>
            </div>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'change'],
        data() {
            return { expanded: false }
        },
        methods: {
            getOptionText(value) {
                let matching = this.setting.options.filter(opt => opt.value == value);
                if (matching.length == 0) return "";
                else return matching[0].text;
            },
            selectOption(settingID, value) {
                this.expanded = false;
                this.change(settingID, value)
            }
        },
        mounted() {
            document.addEventListener("click", e => {
                let options = this.$refs.options;
                if (options && !options.contains(e.target) && options !== e.target) {
                    this.expanded = false;
                }
            });
        }
    }
</script>