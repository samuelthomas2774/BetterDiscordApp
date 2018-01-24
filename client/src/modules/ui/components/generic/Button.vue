<template>
    <div class="bd-button" :class="[{'bd-disabled': disabled}, {'bd-err': type === 'err'}]" @click="!disabled && !loading ? onClick() : null">
        <div v-if="loading" class="bd-spinner-7"></div>
        <slot v-else />
    </div>
</template>
<script>
    export default {
        props: ['loading', 'disabled', 'type', 'onClick', 'type']
    }
</script>