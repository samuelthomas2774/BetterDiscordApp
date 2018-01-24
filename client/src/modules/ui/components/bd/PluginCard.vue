<template src="./templates/PluginCard.html"></template>

<script>
    /*Imports*/
    import { Button, ButtonGroup } from '../generic';
    import MiSettings from 'vue-material-design-icons/settings.vue';
    const components = { MiSettings, Button, ButtonGroup };

    export default {
        props: ['plugin', 'togglePlugin'],
        components,
        name: "PluginCard"
    }
</script>