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
        <BDEdit
            :files="files"
            :snippets="snippets"
            :updateContent="updateContent"
            :runScript="runScript"
        />
    </div>
</template>

<script>

    import { ClientIPC } from 'common';
    import { remote } from 'electron';

    import { BDEdit } from 'bdedit';
    ace.acequire = ace.require;

    export default {
        data() {
            return {
                files: [{ type: 'file', name: 'custom.scss', content: 'asd', savedContent: 'asd', mode: 'scss', saved: true }],
                snippets: [],
                loading: true,
                alwaysOnTop: false,
                error: undefined
            }
        },
        components: { BDEdit },
        created() {
            ClientIPC.on('bd-editor-addFile', (_, file) => this.addFile(file));
            ClientIPC.on('bd-editor-addSnippet', (_, snippet) => this.addSnippet(snippet));
        },
        mounted() {
        },
        methods: {
            addFile(file) { this.files.push(file) },
            addSnippet(snippet) { this.snippets.push(file) },

            updateContent(item, content) {
                item.content = content;
                item.saved = item.content === item.savedContent;
            },

            async runScript(script) {
                return ClientIPC.send('editor-runScript', script);
            },

            toggleaot() {
                this.alwaysOnTop = !this.alwaysOnTop;
                remote.getCurrentWindow().setAlwaysOnTop(this.alwaysOnTop);
            },
            close() {
                window.close();
            }
        }
    }
</script>
