<template>
    <div class="bd-scroller-wrap" :class="{'bd-dark': dark}">
        <slot />
    </div>
</template>
<script>
    export default {
        props: ['dark']
    }
</script>