/**
 * BetterDiscord Colour Setting Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-form-colourpicker">
        <div class="bd-title">
            <h3 v-if="setting.text">{{setting.text}}</h3>
            <div class="bd-colourpicker-wrapper">
                <button class="bd-colourpicker-swatch" :style="{backgroundColor: rgbaString}" @click="open = !open"/>
            </div>
        </div>
        <Picker ref="picker" v-model="colors" @input="pick" :class="{'bd-hidden': !open}"/>
        <div class="bd-hint">{{setting.hint}}</div>
    </div>
</template>
<script>
    import { Chrome as Picker } from 'vue-color';
    export default {
        data() {
            return {
                open: false,
                colors: '#FFF'
            }
        },
        components: {
            Picker
        },
        props: ['setting', 'change'],
        computed: {
            hex() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colors;
                return this.$refs.picker.val.hex;
            },
            rgba() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colors;
                return this.$refs.picker.val.rgba;
            },
            hsva() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colors;
                return this.$refs.picker.val.hsv;
            },
            hsla() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colors;
                return this.$refs.picker.val.hsl;
            },
            rgbaString() {
                if ('string' === typeof this.colors) return this.colors;
                const { rgba } = this.colors;
                return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
            }
        },
        methods: {
            pick(c) {
                this.change(this.rgbaString);
            }
        },
        beforeMount() {
            this.colors = this.setting.value;
        },
        watch: {
            setting(newVal, oldVal) {
                if (newVal.value === oldVal.value) return;
                this.colors = newVal.value;
                this.open = false;
            }
        }
    }
</script>
<style>
    .bd-hidden {
        display: none;
    }
</style>
