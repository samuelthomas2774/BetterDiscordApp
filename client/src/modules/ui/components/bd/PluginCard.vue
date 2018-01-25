<template src="./templates/PluginCard.html"></template>

<script>
    /*Imports*/
    import { Button, ButtonGroup, SettingSwitch } from '../generic';
    import MiSettings from 'vue-material-design-icons/settings.vue';
    import MiReload from 'vue-material-design-icons/refresh.vue';
    import MiEdit from 'vue-material-design-icons/pencil.vue';
    import MiDelete from 'vue-material-design-icons/delete.vue';
    const components = { MiSettings, Button, ButtonGroup, SettingSwitch, MiReload, MiEdit, MiDelete };

    /*Methods*/
    function showSettings() {
        this.settingsOpen = true;
    }
    const methods = {  };

    export default {
        props: ['plugin', 'togglePlugin', 'reloadPlugin', 'showSettings'],
        components,
        name: "PluginCard",
        methods,
        data() {
            return {
                'settingsOpen': false    
            }
        }
    }
</script>