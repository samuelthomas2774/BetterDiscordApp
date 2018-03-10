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
                        <strong>Kappa</strong>
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
    export default {
        data() {
            return {
                emotes: []
            }
        },
        beforeMount() {
            this.emotes = EmoteModule.filterTest();
        },
        methods: {
            getEmoteSrc(emote) {
                let { id, value } = emote;
                if (value.id) value = value.id;
                const uri = emote.type === 2 ? 'https://cdn.betterttv.net/emote/:id/1x' : emote.type === 1 ? 'https://cdn.frankerfacez.com/emoticon/:id/1' : 'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0';
                return uri.replace(':id', value);
            }
        }
    }
</script>
