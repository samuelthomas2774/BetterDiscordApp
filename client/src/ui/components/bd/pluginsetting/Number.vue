/**
 * BetterDiscord Plugin Setting Number Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-numberinput">
        <div class="bd-title">
            <h3>{{setting.text}}</h3>
            <div class="bd-number">
                <input type="number" :value="setting.value" :min="setting.min" :max="setting.max" :step="setting.step" @keyup.stop @change="change"/>
                <div class="bd-number-spinner bd-flex bd-flex-col">
                    <div class="bd-arrow" @click="changeBy(true)"><div class="bd-up-arrow"></div></div>
                    <div class="bd-arrow" @click="changeBy(false)"><div class="bd-down-arrow"></div></div>
                </div>
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
                this.change(this.setting.id, parseFloat(e.target.value));
            },
            changeBy(positive) {
                let step = this.setting.step == undefined ? 1 : this.settings.step;
                this.change(this.setting.id, this.setting.value + (positive ? step : -step));
            }
        }
    }
</script>
