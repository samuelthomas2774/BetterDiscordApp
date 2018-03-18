<template>
    <div id="mount">
        <div class="root">
            <div class="modal"></div>
            <div class="titleBar">
                <div class="logo"></div>
                <span>BetterDiscord Setup</span>
            </div>
            <div class="content-container" :class="{animating, 'animating-reverse': animatingr}">
                <div class="bg-logo"></div>
                <Sidebar :activeIndex="selectedIndex" version="2.0.0" />
                <div class="content">
                    <Intro v-if="selectedPanel === 0"/>
                    <License v-if="selectedPanel === 1"/>
                    <Destination v-if="selectedPanel === 2"/>
                </div>
                <div class="separator-controls"></div>
                <div class="controls">
                    <template v-if="selectedPanel === 0">
                        <button @click="next">Next</button>
                    </template>
                    <template v-if="selectedPanel === 1">
                        <button @click="back">Back</button>
                        <button @click="next">I Agree</button>
                    </template>
                    <template v-if="selectedPanel === 2">
                        <button @click="back">Back</button>
                        <button class="disabled">Install</button>
                    </template>
                    <button @click="cancel">Cancel</button>
                </div>
                <div class="border"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import Sidebar from './sidebar.vue';
    import Intro from './intro.vue';
    import License from './license.vue';
    import Destination from './destination.vue';
    export default {
        data() {
            return {
                selectedIndex: 0,
                selectedPanel: 0,
                animating: false,
                animatingr: false,
                paths: {}
            }
        },
        components: {
            Sidebar,
            Intro,
            License,
            Destination
        },
        methods: {
            next() {
                const active = this.selectedIndex + 1;
                this.animating = true;
                this.selectedIndex = active;
                setTimeout(() => {
                    this.selectedPanel = active;
                    setTimeout(() => {
                        this.animating = false;
                    }, 500);
                }, 500);
            },
            back() {
                const active = this.selectedIndex - 1;
                this.animatingr = true;
                this.selectedIndex = active;
                setTimeout(() => {
                    this.selectedPanel = active;
                    setTimeout(() => {
                        this.animatingr = false;
                    }, 500);
                }, 500);
            },
            cancel() {}
        }
    }
</script>
