/**
 * BetterDiscord Plugin Setting Radio Component
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
            <div class="bd-flex bd-flex-col">
                <label class="bd-radio-option bd-flex" v-for="option in setting.options">
                    <input type="radio" :value="option.value" :name="setting.id" :checked="setting.value == option.value" @change="input">
                    <div class="bd-radio"></div>
                    <span>{{option.text}}</span>
                </label>
            </div>
        </div>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'change'],
        methods: {
            input(e) {
                this.change(this.setting.id, e.target.value);
            }
        }
    }
</script>