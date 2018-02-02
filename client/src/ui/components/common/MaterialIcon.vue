<template>
    <Settings v-if="name === 'settings'" :size="size"/>
    <Refresh v-else-if="name === 'refresh'" :size="size" />
    <Pencil v-else-if="name === 'pencil'" :size="size"/>
    <Delete v-else-if="name === 'delete'" :size="size" />
    <GithubCircle v-else-if="name === 'github-circle'" :size="size" />
    <Web v-else-if="name === 'web'" :size="size" />
    <span v-else></span>
</template>
<script>
    // Imports
    import Settings from './materialicons/Settings.vue';
    import Refresh from './materialicons/Refresh.vue';
    import Pencil from './materialicons/Pencil.vue';
    import Delete from './materialicons/Delete.vue';
    import GithubCircle from './materialicons/GithubCircle.vue';
    import Web from './materialicons/Web.vue';

    export default {
        props: ['name', 'size'],
        components: {
            Settings,
            Refresh,
            Pencil,
            Delete,
            GithubCircle,
            Web
        }
    }
</script>