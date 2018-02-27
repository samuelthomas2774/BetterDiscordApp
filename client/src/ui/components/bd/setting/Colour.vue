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
                <button class="bd-colourpicker-swatch" :style="{backgroundColor: `rgba(${rgbaString})`}" @click="open = !open"/>
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
                colors: '#3e82e5',
                open: false
            }
        },
        components: {
            Picker
        },
        props: ['setting'],
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
                return this.$refs.picker.hsv;
            },
            hsla() {
                if (!this.$refs.picker || !this.$refs.picker.val) return this.colors;
                return this.$refs.picker.hsl;
            },
            rgbaString() {
                const rgba = this.rgba;
                if (!rgba.r) return this.colors;
                return `${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a}`;
            }
        },
        methods: {
            pick(c) {
                
            }
        }
    }
</script>
<style>
    .bd-hidden {
        display: none;
    }
    .bd-form-colourpicker .bd-title {
        display: flex;
    }
    .bd-form-colourpicker .bd-title h3 {
        font-weight: 500;
        color: #f6f6f7;
        flex: 1;
        line-height: 24px;
        margin-bottom: 0;
        margin-top: 0;
    }
    .bd-colourpicker-swatch {
        width: 50px;
        height: 30px;
        border-radius: 3px;
        border: 1px solid hsla(0,0%,100%,.1);
    }
</style>
