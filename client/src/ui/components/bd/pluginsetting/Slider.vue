/**
 * BetterDiscord Plugin Setting Slider Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-slider">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
            <div class="bd-slider">
                <div class="bd-slider-container">
                    <div class="bd-slider-bar">
                        <div class="bd-slider-bar-filled" :style="'width: ' + (((this.setting.value - (this.setting.min || 0)) / ((this.setting.max || 100) - (this.setting.min || 0))) * 100) + '%;'"></div>
                    </div>
                    <input type="range" :value="setting.value" :min="setting.min || 0" :max="setting.max || 100" :step="setting.step || 1" @keyup.stop @input="input" />
                </div>
            </div>
        </div>
        <div class="bd-hint">{{ setting.hint }}</div>
    </div>
</template>
<script>
    export default {
        props: ['setting', 'change'],
        data() {
            return {
                fillpercentage: 0
            };
        },
        methods: {
            input(e) {
                let number = parseFloat(e.target.value);
                if (Number.isNaN(number)) return;

                this.change(this.setting.id, number);
            }
        }
    }
</script>
