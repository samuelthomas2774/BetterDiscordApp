/**
 * BetterDiscord Setting Slider Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-slider" @mouseenter="showTooltip" @mouseleave="hideTooltip">
        <div class="bd-title">
            <h3>{{ setting.text }}</h3>
            <div class="bd-slider">
                <div class="bd-slider-container">
                    <div class="bd-slider-points">
                        <div class="bd-slider-point" v-for="(label, point) in setting.points" :style="{left: `${getPointPosition(point) * 100}%`}">{{ label }}</div>
                    </div>
                    <div class="bd-slider-bar">
                        <div class="bd-slider-bar-filled" :style="{width: `${getPointPosition() * 100}%`}"></div>
                    </div>
                    <div class="bd-slider-thumb-wrap">
                        <div class="bd-slider-thumb" v-tooltip="{content: (value || '0') + setting.unit, show: toolTip, trigger: 'manual'}" :style="{left: `${getPointPosition() * 100}%`}"></div>
                    </div>
                    <input type="range" :value="value" :min="setting.min || 0" :max="setting.max || 100" :step="setting.step || 1" @keyup.stop @input="input" />
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
                fillpercentage: 0,
                toolTip: false
            };
        },
        computed: {
            value() {
                return this.setting.value / this.setting.multi;
            }
        },
        methods: {
            input(e) {
                let number = parseFloat(e.target.value);
                if (Number.isNaN(number)) return;
                this.change(number * this.setting.multi);
            },
            getPointPosition(value) {
                return ((value || this.value) - (this.setting.min || 0)) / ((this.setting.max || 100) - (this.setting.min || 0));
            },
            showTooltip() {
                this.toolTip = true;
            },
            hideTooltip() {
                this.toolTip = false;
            }
        }
    }
</script>
