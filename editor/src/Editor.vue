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
                :readFile="readFile"
                :readSnippet="readSnippet"
                :injectStyle="injectStyle"
                :toggleLiveUpdate="toggleLiveUpdate"/>
    </div>
</template>

<script>

    import { ClientIPC } from 'common';
    import { remote } from 'electron';

    import { BDEdit } from 'bdedit';
import { FileUtils } from '../../core/src/modules/utils';
    ace.acequire = ace.require;

    const modes = {
        'css': 'css',
        'scss': 'scss',
        'js': 'javascript',
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
                error: undefined,
                lastSaved: undefined
            }
        },
        components: { BDEdit },
        created() {
            ClientIPC.on('bd-editor-addFile', (_, file) => {
                if (this.files.find(f => f.name === file.name)) return;
                this.addFile(file);
            });

            ClientIPC.on('bd-editor-remFile', (_, file) => {
                this.files = this.files.filter(f => f.name !== file.name);
            });

            ClientIPC.on('bd-editor-addSnippet', (_, snippet) => {
                if (this.snippets.find(s => s.name === snippet.name)) return;
                this.addSnippet(snippet);
            });

            ClientIPC.on('bd-editor-remSnippet', (_, snippet) => {
                this.snippets = this.snippets.filter(s => s.name !== snippet.name);
            });

            ClientIPC.on('bd-editor-fileChange', (_, file) => {
                if (this.lastSaved && this.lastSaved.name === file.name) { // If we saved in our editor then don't trigger
                    this.lastSaved = undefined;
                    return;
                }

                const f = this.files.find(f => f.name === file.name);
                if (f) f.changed = true;
            });
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

                if (this.liveUpdateTimeout) clearTimeout(this.liveUpdateTimeout);
                if (item.liveUpdateEnabled) {
                    this.liveUpdateTimeout = setTimeout(() => {
                        this.injectStyle(item);
                    }, 5000);
                }
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
                    newName = `${prefix.split('.')[0]}_${iter}.${prefix.split('.')[1]}`;
                    iter++;
                }

                const newItem = { type: 'file', name: newName, content: '', mode, saved: false, read: true };
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

                const newItem = { type: 'snippet', name: newName, content: '', savedContent: '', mode, saved: false, read: true };
                this.snippets.push(newItem);
                return newItem;
            },

            async saveFile(file) {
                try {
                    this.lastSaved = file;
                    const result = await ClientIPC.send('bd-editor-saveFile', file);
                    file.savedContent = file.content;
                    file.saved = true;
                } catch (err) {
                    console.log(err);
                }
            },

            async saveSnippet(snippet) {
                // TODO only saved snippets should save not all when one is saved.
                snippet.saved = true;
                snippet.savedContent = snippet.content;
                const result = await ClientIPC.send('bd-editor-saveSnippet', this.snippets.map(snippet => {
                    return {
                        name: snippet.name,
                        content: snippet.savedContent
                    }
                }));
                console.log(result);
            },

            async readFile(file) {
                const content = await ClientIPC.send('editor-readFile', file);
                file.read = true;
                file.changed = false;
                file.content = file.savedContent = content;
                return content;
            },

            async readSnippet(snippet) {
                const content = await ClientIPC.send('editor-readSnippet', snippet);
                snippet.read = true;
                return content;
            },

            async injectStyle(item) {
                if (item.content === '') return;
                const result = await ClientIPC.send('bd-editor-injectStyle', { id: item.name.split('.')[0], style: item.content, mode: item.mode });
                return result;
            },

            toggleLiveUpdate(item) {
                item.liveUpdateEnabled = !item.liveUpdateEnabled;
                return item;
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
