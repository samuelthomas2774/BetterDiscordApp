<template>
    <div class="sidebar">
        <ul>
            <li v-for="(item, index) in items" :key="index" :class="{active: activeIndex === index}">{{item}}</li>
        </ul>
        <span class="vi">v{{version}}</span>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                items: [
                    'Introduction',
                    'License & ToS',
                    'Destination',
                    'Installation'
                ]
            }
        },
        props: ['activeIndex', 'version']
    }
</script>
