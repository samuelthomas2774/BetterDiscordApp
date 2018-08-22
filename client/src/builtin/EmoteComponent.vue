<template>
    <img class="bd-emote emoji" :class="{jumboable}" :src="src" :alt="`;${name};`" v-tooltip="{ content: `;${name};`, delay: { show: 750, hide: 0 } }" />
</template>

<script>
    import { ClientLogger as Logger } from 'common';
    import EmoteModule from './EmoteModule';
    import { MiStar } from '../ui/components/common';

    export default {
        components: {
            MiStar
        },
        props: ['src', 'name', 'hasWrapper', 'jumboable'],
        data() {
            return {
                EmoteModule
            };
        },
        computed: {
            favourite() {
                return false;
            }
        },
        methods: {
            async toggleFavourite() {
                await EmoteModule.setFavourite(this.name, !this.favourite);
                Logger.log('EmoteComponent', `Set emote ${this.name} as ${this.favourite ? '' : 'un'}favourite`);
            }
        }
    }
</script>
