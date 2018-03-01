/**
 * BetterDiscord Setting Dropdown Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-dropdown">
        <div class="bd-title">
            <h3 v-if="setting.text">{{setting.text}}</h3>
            <Dropdown v-if="!setting.fullwidth" :options="setting.options" :selected="setting.args.value" :disabled="setting.disabled" :change="change" />
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
        <Dropdown v-if="setting.fullwidth" :options="setting.options" :selected="setting.value" :disabled="setting.disabled" :change="change" />
    </div>
</template>
<script>
    import Dropdown from '../../common/Dropdown.vue';

    export default {
        props: ['setting', 'change'],
        components: {
            Dropdown
        },
        data() {
            return {
                active: false
            };
        },
        methods: {
            selectOption(option) {
                this.active = false;
                this.change(option.id);
            }
        },
        mounted() {
            document.addEventListener("click", e => {
                let options = this.$refs.options;
                if (options && !options.contains(e.target) && options !== e.target) {
                    this.active = false;
                }
            });
        }
    }
</script>
