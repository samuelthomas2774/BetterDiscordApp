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
    <div class="bd-autocomplete">
        <div v-if="search.items.length" class="bd-autocompleteInner">
            <div class="bd-autocompleteRow">
                <div class="bd-autocompleteSelector">
                    <div class="bd-autocompleteTitle">
                        Matching:
                        <strong>{{sterm}}</strong>
                    </div>
                </div>
            </div>
            <div v-for="(item, index) in search.items" class="bd-autocompleteRow" @mouseover="selectedIndex = index" @click="inject">
                <div class="bd-autocompleteSelector bd-selectable" :class="{'bd-selected': index === selectedIndex}">
                    <div class="bd-autocompleteField">
                        <img v-if="search.actype === 'imagetext'" :src="item.value.src" :alt="item.key" />
                        <div class="bd-flexGrow">{{item.key}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { WebpackModules, DiscordApi } from 'modules';
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
        props: ['prefix', 'controller', 'textarea'],
        computed: {
        },
        created() {
            window.addEventListener('keydown', this.keyDown);
            window.addEventListener('keyup', this.keyUp);
        },
        destroyed() {
            window.removeEventListener('keydown', this.keyDown);
            window.removeEventListener('keyup', this.keyUp);
        },
        methods: {
            keyDown(e) {
                if (!this.open) return;

                const { which, key } = e;

                if (key === 'ArrowDown' || key === 'ArrowUp') this.traverse(key);
                else if (key !== 'Tab' && key !== 'Enter') return;
                
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
                    this.selectedIndex = (this.selectedIndex - 1) < 0 ? Math.min(this.search.items.length, 10) - 1 : this.selectedIndex - 1;
                    return;
                }
                if (key === 'ArrowDown') {
                    this.selectedIndex = (this.selectedIndex + 1) >= Math.min(this.search.items.length, 10) ? 0 : this.selectedIndex + 1;
                    return;
                }
            },
            inject() {
                if (!this.textArea) return;
                const { selectionEnd, value } = this.textArea;

                let substr = value.substr(0, selectionEnd);
                substr = substr.replace(new RegExp(this.fsterm + '$'), this.search.items[this.selectedIndex].value.replaceWith);

                WebpackModules.getModuleByName('DraftActions').saveDraft(DiscordApi.currentChannel.id, substr + value.substr(selectionEnd, value.length));
                this.textArea.selectionEnd = this.textArea.selectionStart = selectionEnd + this.search.items[this.selectedIndex].value.replaceWith.length - this.fsterm.length;
                this.open = false;
                this.search = { type: null, items: [] };
            }
        }
    }
</script>
