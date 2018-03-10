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
                        <strong>{{title || initial}}</strong>
                    </div>
                </div>
            </div>
            <div v-for="emote in emotes" class="bd-autocompleteRow">
                <div class="bd-autocompleteSelector">
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
    export default {
        data() {
            return {
                emotes: [],
                title: null
            }
        },
        props: ['initial'],
        beforeMount() {
            this.emotes = EmoteModule.filter(new RegExp(this.initial, 'i'), 10);
        },
        created() {
            document.querySelector('.chat textarea').addEventListener('keyup', this.searchEmotes);
        },
        destroyed() {
            document.querySelector('.chat textarea').removeEventListener('keyup', this.searchEmotes);
        },
        methods: {
            getEmoteSrc(emote) {
                let { id, value } = emote;
                if (value.id) value = value.id;
                const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
                return uri.replace(':id', value);
            },
            searchEmotes(e) {
                const sterm = e.target.value.split(' ').slice(-1).pop();
                if (sterm.length < 3) {
                    this.emotes = null;
                    return;
                }
                this.title = sterm;
                this.emotes = EmoteModule.filter(new RegExp(sterm, 'i'), 10);
            }
        }
    }
</script>
