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
        <div v-if="emotes && emotes.length" class="bd-autocomplete-inner">
            <div class="bd-autocompleteRow">
                <div class="bd-autocompleteSelector">
                    <div class="bd-autocompleteTitle">
                        Emotes Matching:
                        <strong>{{title}}</strong>
                    </div>
                </div>
            </div>
            <div v-for="(emote, index) in emotes" class="bd-autocompleteRow" :key="index">
                <div class="bd-autocompleteSelector bd-selectable" :class="{'bd-selected': index === selectedIndex}" @mouseover="() => { selected = emote.id }" @click="() => inject(emote)">
                    <div class="bd-autocompleteField">
                        <img :src="getEmoteSrc(emote)"/>
                        <div>{{emote.id}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { EmoteModule } from 'builtin';
    import { Events } from 'modules';
    import { DOM } from 'ui';
    export default {
        data() {
            return {
                emotes: [],
                title: '',
                selIndex: 0,
                selected: '',
                open: false,
                selectedIndex: 0,
                sterm: ''
            }
        },
        props: ['initial'],
        beforeMount() {
            // this.emotes = EmoteModule.filter(new RegExp(this.initial, 'i'), 10);
            // this.open = this.emotes.length;
        },
        created() {
            window.addEventListener('keydown', this.prevents);
            const ta = document.querySelector('.chat textarea');
            if(!ta) return;
            ta.addEventListener('keydown', this.setCaret);
            ta.addEventListener('keyup', this.searchEmotes);
        },
        destroyed() {
            window.removeEventListener('keydown', this.prevents);
            const ta = document.querySelector('.chat textarea');
            if (!ta) return;
            ta.removeEventListener('keydown', this.setCaret);
            ta.removeEventListener('keyup', this.searchEmotes);
        },
        methods: {
            prevents(e) {
                if (!this.open) return;
                if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Tab') return;
                e.stopPropagation();
                e.preventDefault();
            },
            setCaret(e) {
                this.caret = e.target.selectionEnd;
            },
            getEmoteSrc(emote) {
                let { id, value } = emote;
                if (value.id) value = value.id;
                const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
                return uri.replace(':id', value);
            },
            searchEmotes(e) {
                if (e.key === 'ArrowDown' && this.open && this.caret) {
                    this.selectedIndex = (this.selectedIndex + 1) >= 10 ? 0 : this.selectedIndex + 1;
                    return;
                } else if (e.key === 'ArrowUp' && this.open && this.caret) {
                    this.selectedIndex = (this.selectedIndex - 1) < 0 ? 9 : this.selectedIndex - 1;
                    return;
                }
                if (e.key === 'Tab' && this.open && this.caret) {
                    const selected = this.emotes[this.selectedIndex];
                    if (!selected) return;
                    this.inject(selected);
                    this.open = false;
                    return;
                }
                if (e.key === 'Tab' && !this.open) this.open = true;
                if (!this.open) return;
                const se = e.target.selectionEnd;
                this.sterm = e.target.value.substr(0, se).split(' ').slice(-1).pop();

                if (this.sterm.length < 3) {
                    this.reset();
                    return;
                }
                this.title = this.sterm;
                this.emotes = EmoteModule.filter(new RegExp(this.sterm, ''), 10);
                this.open = this.emotes.length;
            },
            reset() {
                this.emotes = [];
                this.title = '';
                this.selIndex = 0;
                this.selected = '';
                this.open = false;
                this.selectedIndex = 0;
                this.sterm = '';
            },
            inject(emote) {
                const ta = document.querySelector('.chat textarea');
                if (!ta) return;
                const currentText = document.querySelector('.chat textarea').value;
                const se = ta.selectionEnd;
                const split = currentText.substr(0, se).split(' ');
                split.pop();
                split.push(`:${emote.id}:`);
                const join = split.join(' ');
                const rest = currentText.substr(se, currentText.length);
                DOM.manip.setText(join + ' ' + rest, false);
                this.emotes = [];
                this.open = false;
                this.selectedIndex = 0;
                this.selected = '';
                ta.selectionEnd = ta.selectionStart = se + `:${emote.id}:`.length - this.title.length;
            }
        }
    }
</script>
