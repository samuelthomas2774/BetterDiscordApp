<template>
    <span class="bd-emotewrapper" v-tooltip="name">
        <img class="bd-emote" :src="src" :alt="name"/>
    </span>
</template>

<script>
    export default {
        data() {
            return {
                favourite: false
            }
        },
        props: ['src', 'name'],
        methods: {
        },
        beforeMount() {
            // Check favourite state
        }
    }
</script>
