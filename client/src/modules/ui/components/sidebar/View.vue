<template src="./templates/View.html"></template>
<script>
    /*Imports*/
    import { ScrollerWrap } from '../generic';
    const components = { ScrollerWrap };

    export default {
        components,
        props: ['contentVisible', 'animating']
    }
</script>