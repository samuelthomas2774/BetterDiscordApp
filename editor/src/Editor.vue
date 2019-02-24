<template>
    <div class="container">
        <div class="titlebar">
            <div class="draggable"></div>
            <div class="icon">
                <div class="inner"></div>
            </div>
            <div class="title">Content Editor</div>
            <div class="flex-spacer"></div>
            <div class="controls">
                <button :class="{active: alwaysOnTop}" ref="aot" title="Toggle always on top" @click="toggleaot">P</button>
                <button title="Close CSS Editor" @click="close">X</button>
            </div>
        </div>
        <BDEdit />
    </div>
</template>

<script>

    import { BDEdit } from 'bdedit';
    ace.acequire = ace.require;

    export default {
        components: { BDEdit },
        mounted() {
            console.log(ace);
        }
    }
</script>
