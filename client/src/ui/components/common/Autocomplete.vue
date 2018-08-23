/**
 * BetterDiscord Autocomplete Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-ac">
        <div v-if="search.items.length" class="bd-acInner">
            <div class="bd-acRow">
                <div class="bd-acSelector">
                    <div class="bd-acTitle">
                        {{search.title[0] || search.title}}
                        <strong v-if="search.title.length >= 2">{{search.title[1] || sterm}}</strong>
                        <strong v-if="search.title.length === 3" :style="{float: 'right'}">{{search.title[2]}}</strong>
                    </div>
                </div>
            </div>
            <div class="bd-acScroller" ref="scroller">
                <div v-for="(item, index) in search.items" class="bd-acRow" @mouseover="selectedIndex = index" @click="inject">
                    <div class="bd-acSelector bd-selectable" :class="{'bd-selected': index === selectedIndex}">
                        <div class="bd-acField">
                            <img v-if="search.type === 'imagetext'" :src="item.src || item.value.src" :alt="item.key || item.text || item.alt" />
                            <div class="bd-flexGrow">{{item.key || item.text}}</div>
                            <div class="bd-acHint" v-if="item.hint || (item.value && item.value.hint)">{{item.hint || item.value.hint}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { WebpackModules, DiscordApi, Events } from 'modules';
    let wtf = null;
    export default {
        data() {
            return {
                open: false,
                fsterm: '',
                sterm: '',
                search: { type: null, items: [] },
                selectedIndex: 0,
                textArea: null
            }
        },
        props: ['prefix', 'controller', '_insertText', '_ref'],
        computed: {
        },
        created() {
            this.attachListeners();
        },
        methods: {
            attachListeners() {
                if (this._isDestroyed) return;
                const ta = document.querySelector('.da-textAreaEdit') || document.querySelector('.da-textArea');
                if (!ta) return setTimeout(this.attachListeners, 10);
                this.ta = ta;
                ta.addEventListener('keydown', this.keyDown);
                ta.addEventListener('keyup', this.keyUp);
            },
            keyDown(e) {
                if (!this.open) return;

                const { which, key } = e;

                if (key === 'ArrowDown' || key === 'ArrowUp') this.traverse(key);
                else if (key === 'ArrowLeft' || key === 'ArrowRight') {
                    if (!this.toggle(e)) return;
                } else if (key !== 'Tab' && key !== 'Enter') return;

                e.stopPropagation();
                e.preventDefault();
            },
            keyUp(e) {
                const { which, key, target } = e;
                if (which === 27 || key === 'ArrowDown' || key === 'ArrowUp') return;
                if ((key === 'Tab' || key === 'Enter') && this.open) {
                    this.inject();
                    return;
                }

                const { selectionEnd, value } = target;
                const sterm = value.slice(0, selectionEnd).split(/\s+/g).pop();

                const prefix = sterm.slice(0, 1);
                const search = this.controller.items(prefix, sterm.slice(1));
                const { type, items } = search;

                if (!items || !items.length) {
                    this.open = false;
                    this.search = { type: null, items: [] };
                    return;
                }

                this.textArea = target;
                this.selectedIndex = 0;
                this.fsterm = sterm;
                this.sterm = sterm.slice(1);
                this.open = true;
                this.search = search;
            },
            traverse(key) {
                if (!this.open) return;
                if (key === 'ArrowUp') {
                    this.selectedIndex = (this.selectedIndex - 1) < 0 ? this.search.items.length - 1 : this.selectedIndex - 1;
                    this.$refs.scroller.scrollTop = (this.selectedIndex + 1) * 32 - 320;
                    return;
                }
                if (key === 'ArrowDown') {
                    this.selectedIndex = (this.selectedIndex + 1) >= this.search.items.length ? 0 : this.selectedIndex + 1;
                    this.$refs.scroller.scrollTop = (this.selectedIndex + 1) * 32 - 320;
                    return;
                }
            },
            insertText(startIndex, text) {
                this.ta.selectionStart = startIndex;
                this._insertText(text);
            },
            inject() {
                if (!this.ta) return;
                this.insertText(this.ta.selectionStart - this.fsterm.length, this.search.items[this.selectedIndex].value.replaceWith);
                this.open = false;
                this.search = { type: null, items: [] };
            },
            toggle(e) {
                const { selectionEnd, value } = e.target;
                const sterm = value.slice(0, selectionEnd).split(/\s+/g).pop();
                const prefix = sterm.slice(0, 1);
                return this.controller.toggle(prefix, sterm, e);
            }
        }
    }
</script>
