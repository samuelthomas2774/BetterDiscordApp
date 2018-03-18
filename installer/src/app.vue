<template>
    <div id="mount">
        <div class="root">
            <div class="modal"></div>
            <div class="titleBar">
                <div class="logo"></div>
                <span>BetterDiscord Setup</span>
            </div>
            <div class="content-container">
                <div class="bg-logo"></div>
                <Sidebar :activeIndex="0" version="2.0.0" />
                <div class="content"></div>
                <div class="separator-controls"></div>
                <div class="controls"></div>
                <div class="border"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import Sidebar from './sidebar.vue';
    export default {
        components: {
            Sidebar
        }
    }
</script>
