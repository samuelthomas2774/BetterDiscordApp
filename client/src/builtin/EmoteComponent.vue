<template>
    <span class="bd-emotewrapper" :class="{'bd-emote-favourite': favourite, 'bd-emote-no-wrapper': !hasWrapper}" v-tooltip="name" :data-emote-name="name">
        <img class="bd-emote" :src="src" :alt="`;${name};`" @click="toggleFavourite" />

        <span v-if="favourite" style="font-size: 12px;"> (favourite)</span>
    </span>
</template>

<script>
    import { ClientLogger as Logger } from 'common';
    import EmoteModule from './EmoteModule';

    export default {
        data() {
            return {
                EmoteModule
            };
        },
        props: ['src', 'name', 'hasWrapper'],
        computed: {
            favourite() {
                return EmoteModule.isFavourite(this.name);
            }
        },
        methods: {
            async toggleFavourite() {
                await EmoteModule.setFavourite(this.name, !this.favourite);
                Logger.log('EmoteComponent', `Set emote ${this.name} as ${this.favourite ? '' : 'un'}favourite`);
                this.$forceUpdate();
            }
        }
    }
</script>
