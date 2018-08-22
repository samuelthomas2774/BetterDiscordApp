/**
 * BetterDiscord Context Menu Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div ref="root" class="bd-cm" :class="{'bd-cmRenderLeft': renderLeft}" v-if="activeMenu && activeMenu.menu" :style="calculatePosition()">
        <CMGroup v-for="(group, index) in activeMenu.menu.groups" :items="group.items" :key="index" :left="left" :top="top" @close="hide" />
    </div>
</template>

<script>
    // Imports
    import { BdContextMenu } from 'ui';
    import CMGroup from './contextmenu/Group.vue';

    export default {
        data() {
            return {
                activeMenu: BdContextMenu.activeMenu,
                visibleSub: -1,
                left: -1,
                top: -1,
                renderLeft: false
            };
        },
        components: { CMGroup },
        methods: {
            calculatePosition() {
                if (!this.activeMenu.menu.groups.length) return {};
                this.mouseX = this.activeMenu.menu.x;
                this.mouseY = this.activeMenu.menu.y;
                const height = this.activeMenu.menu.groups.reduce((total, group) => total + group.items.length, 0) * 28;
                this.top = window.innerHeight - this.mouseY - height < 0 ? this.mouseY - height : this.mouseY;
                this.left = window.innerWidth - this.mouseX - 170 < 0 ? this.mouseX - 170 : this.mouseX;
                this.renderLeft = (this.left + 170 * 2) > window.innerWidth;
                window.addEventListener('mousedown', this.clickHide);
                return { top: `${this.top}px`, left: `${this.left}px` };
            },
            hide() {
                window.removeEventListener('mousedown', this.clickHide);
                this.activeMenu.menu = null;
            },
            clickHide(e) {
                if (!this.$refs.root) return;
                if (this.$refs.root.contains(e.target)) return;
                this.hide();
            }
        }
    }
</script>
