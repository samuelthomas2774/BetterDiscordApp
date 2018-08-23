/**
 * BetterDiscord Context Menu Group Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-cmGroup">
        <template v-for="(item, index) in items">
            <div v-if="item.type === 'sub'" class="bd-cmItem bd-cmSub" @mouseenter="subMenuMouseEnter($event, index, item)" @mouseleave="subMenuMouseLeave($event, index, item)">
                {{item.text}}
                <MiChevronDown />
                <div v-if="index === visibleSub" :class="['bd-cm', {'bd-cmRenderLeft': subRenderLeft}]" :style="subStyle">
                    <CMGroup :items="item.items" :top="subTop" :left="subLeft" @close="$emit('close')" />
                </div>
            </div>

            <CMToggle v-else-if="item.type === 'toggle'" :item="item" :checked="item.checked" @click="item.checked = item.onChange(!item.checked, target)" />
            <CMButton v-else :item="item" @click="item.onClick ? item.onClick($event) : undefined; item.type === 'button' ? $emit('close') : undefined" />
        </template>
    </div>
</template>

<script>
    // Imports
    import CMButton from './Button.vue';
    import CMToggle from './Toggle.vue';
    import { MiChevronDown } from '../common';

    export default {
        name: 'CMGroup',
        components: {
            CMButton, CMToggle, MiChevronDown
        },
        props: ['items', 'left', 'top', 'target'],
        data() {
            return {
                visibleSub: -1,
                subStyle: {},
                subTop: 0,
                subLeft: 0,
                subRenderLeft: false
            };
        },
        methods: {
            subMenuMouseEnter(e, index, sub) {
                const subHeight = sub.items.length > 9 ? 270 : sub.items.length * e.target.offsetHeight;
                this.subTop = this.top + subHeight + e.target.offsetTop > window.innerHeight ?
                    this.top - subHeight + e.target.offsetTop + e.target.offsetHeight :
                    this.top + e.target.offsetTop;
                this.subRenderLeft = (this.left + 170 * 2) > window.innerWidth;
                this.subLeft = this.left + (!this.subRenderLeft ? e.target.clientWidth : 0);
                this.subStyle = { top: `${this.subTop - 2}px`, left: `${this.subLeft}px` };
                this.visibleSub = index;
            },
            subMenuMouseLeave(e, index, sub) {
                this.visibleSub = -1;
            }
        }
    }
</script>

// return typeof this.item.checked === 'function' ? this.item.checked(target) : this.item.checked;
