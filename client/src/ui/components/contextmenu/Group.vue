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
    <div class="bd-cmGroup" ref="test">
        <template v-for="(item, index) in items">
            <CMButton v-if="!item.type || item.type === 'button'" :item="item" :onClick="() => { item.onClick(); closeMenu(); }" />
            <CMToggle v-else-if="item.type === 'toggle'" :item="item" :checked="typeof item.checked === 'function' ? item.checked(target) : item.checked" :onClick="() => { typeof item.checked === 'function' ? (item.onChange(!item.checked(target), target), $forceUpdate()) : item.onChange(!item.checked) }" />
            <div v-else-if="item.type === 'sub'" class="bd-cmItem bd-cmSub" @mouseenter="e => subMenuMouseEnter(e, index, item)" @mouseleave="e => subMenuMouseLeave(e, index, item)">
                {{item.text}}
                <MiChevronDown />
                <div ref="test2" class="bd-cm" v-if="index === visibleSub" :style="subStyle">
                    <template v-for="(item, index) in item.items">
                        <CMButton v-if="!item.type || item.type === 'button'" :item="item" :onClick="() => { item.onClick(); closeMenu(); }" />
                        <CMToggle v-else-if="item.type === 'toggle'" :item="item" :checked="typeof item.checked === 'function' ? item.checked(target) : item.checked" :onClick="() => { typeof item.checked === 'function' ? item.onChange(!item.checked(target), target) && $forceUpdate() : item.onChange(!item.checked) }" />
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    // Imports
    import CMButton from './Button.vue';
    import CMToggle from './Toggle.vue';
    import { MiChevronDown } from '../common';

    export default {
        data() {
            return {
                visibleSub: -1,
                subStyle: {}
            }
        },
        props: ['items', 'closeMenu', 'left', 'top', 'target'],
        components: { CMButton, CMToggle, MiChevronDown },
        methods: {
            subMenuMouseEnter(e, index, sub) {
                const subHeight = sub.items.length > 9 ? 270 : sub.items.length * e.target.offsetHeight;
                const top = this.top + subHeight + e.target.offsetTop > window.innerHeight ?
                    this.top - subHeight + e.target.offsetTop + e.target.offsetHeight :
                    this.top + e.target.offsetTop;
                this.subStyle = { top: `${top}px`, left: `${this.left}px` };
                this.visibleSub = index;
            },
            subMenuMouseLeave(e, index, sub) {
                this.visibleSub = -1;
            }
        }
    }
</script>

// return typeof this.item.checked === 'function' ? this.item.checked(target) : this.item.checked;
