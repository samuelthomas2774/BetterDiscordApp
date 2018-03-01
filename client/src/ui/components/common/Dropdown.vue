/**
 * BetterDiscord Dropdown Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-dropdown" :class="{'bd-active': active, 'bd-disabled': disabled}">
        <div class="bd-dropdown-current" @click="() => active = !active && !disabled">
            <span class="bd-dropdown-text">{{ getOptionText(selected) }}</span>
            <span class="bd-dropdown-arrow-wrap">
                <span class="bd-dropdown-arrow"></span>
            </span>
        </div>
        <div class="bd-dropdown-options bd-flex bd-flex-col" ref="options" v-if="active">
            <div class="bd-dropdown-option" v-for="option in options" :class="{'bd-dropdown-option-selected': selected === option.id}" @click="selectOption(option)">{{ option.text }}</div>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['options', 'selected', 'disabled', 'change'],
        data() {
            return {
                active: false
            };
        },
        methods: {
            getOptionText(value) {
                let matching = this.options.filter(opt => opt.id === value);
                if (matching.length == 0) return "";
                else return matching[0].text;
            },
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
