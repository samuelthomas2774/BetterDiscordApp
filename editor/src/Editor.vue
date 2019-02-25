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
        <div id="spinner" v-if="loading">
            <div class="valign">Loading Please Wait...</div>
        </div>
        <BDEdit v-else :files="files"
                :snippets="snippets"
                :updateContent="updateContent"
                :runScript="runScript"
                :newFile="newFile"
                :saveFile="saveFile"
                :newSnippet="newSnippet"
                :saveSnippet="saveSnippet"
                :injectStyle="injectStyle"/>
    </div>
</template>

<script>

    import { ClientIPC } from 'common';
    import { remote } from 'electron';

    import { BDEdit } from 'bdedit';
    ace.acequire = ace.require;

    const modes = {
        'css': 'css',
        'scss': 'scss',
        'js': 'js',
        'txt': 'text',
        'json': 'json'
    };

    function resolveMode(fileName) {
        if (!fileName.includes('.')) return 'text';
        const ext = fileName.substr(fileName.lastIndexOf('.') + 1);
        if (modes.hasOwnProperty(ext)) return modes[ext];
        return 'text';
    }

    export default {
        data() {
            return {
                files: [],
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
            (async () => {
                this.files = await ClientIPC.send('bd-editor-getFiles');
                this.snippets = await ClientIPC.send('bd-editor-getSnippets');

                this.loading = false;
            })();
        },
        methods: {
            addFile(file) {
                this.files.push(file);
            },
            addSnippet(snippet) { this.snippets.push(file) },

            updateContent(item, content) {
                item.content = content;
                item.saved = item.content === item.savedContent;
            },

            async runScript(script) {
                return ClientIPC.send('editor-runScript', script);
            },

            newFile(fileName) {
                const prefix = fileName;
                const mode = resolveMode(fileName);

                let newName = prefix;
                let iter = 0;

                while (this.files.find(file => file.name === newName)) {
                    newName = `${prefix}_${iter}`;
                    iter++;
                }

                const newItem = { type: 'file', name: newName, content: '', mode, saved: false };
                this.files.push(newItem);
                return newItem;
            },

            newSnippet(snippetName) {
                const prefix = snippetName;
                const mode = resolveMode(snippetName);

                let newName = prefix;
                let iter = 0;

                while (this.snippets.find(snippet => snippet.name === newName)) {
                    newName = `${prefix}_${iter}`;
                    iter++;
                }

                const newItem = { type: 'snippet', name: newName, content: '', mode, saved: false };
                this.snippets.push(newItem);
                return newItem;
            },

            async saveFile(file) {
                const result = await ClientIPC.send('bd-editor-saveFile', file);
                console.log(result);
            },

            async saveSnippet(snippet) {
                const result = await ClientIPC.send('bd-editor-saveSnippet', snippet);
                console.log(result);
            },

            async injectStyle(item) {
                const result = await ClientIPC.send('bd-editor-injectStyle', { id: item.name.split('.')[0], style: item.content, mode: item.mode });
                return result;
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
