<template src="./templates/BdSettingsWrapper.html"></template>
<script>
    /*Imports*/
    import BdSettings from './BdSettings.vue';
    const components = { BdSettings };

    /*Methods*/
    function showSettings() { this.active = true; }
    function hideSettings() { this.active = false; }

    const methods = { showSettings, hideSettings };

    let globalKeyListener;

    export default {
        components,
        methods,
        data() {
            return {
                active: false,
                platform: global.process.platform
            }
        },
        created: function () {
            window.addEventListener('keyup', globalKeyListener = e => {
                if (this.active && e.which === 27) {
                    this.hideSettings();
                    return;
                }
                if (!e.metaKey && !e.ctrlKey || e.key !== 'b') return;

                !this.active ? this.showSettings() : this.hideSettings();

                e.stopImmediatePropagation();
            });
        },
        destroyed: function () {
            if (globalKeyListener) window.removeEventListener('keyup', globalKeyListener);
        }
    }
</script>
