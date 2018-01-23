<template src="./templates/Item.html"></template>
<script>
    /*Imports*/
    import { SidebarHeader, SidebarButton } from './';
    const components = { SidebarHeader, SidebarButton };

    export default {
        components,
        props: ['item', 'onClick']
    }
</script>