<template src="./templates/PluginCard.html"></template>

<script>
    /*Imports*/
    import { Button, ButtonGroup } from '../generic';
    import MiSettings from 'vue-material-design-icons/settings.vue';
    import MiReload from 'vue-material-design-icons/refresh.vue';
    import MiEdit from 'vue-material-design-icons/pencil.vue';
    import MiDelete from 'vue-material-design-icons/delete.vue';
    const components = { MiSettings, Button, ButtonGroup, MiReload, MiEdit, MiDelete };

    export default {
        props: ['plugin', 'togglePlugin'],
        components,
        name: "PluginCard"
    }
</script>