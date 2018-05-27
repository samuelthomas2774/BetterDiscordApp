<template>
    <div class="container">
        <div class="titlebar">
            <div class="draggable"></div>
            <div class="icon">
                <div class="inner"></div>
            </div>
            <div class="title">CSS Editor</div>
            <div class="flex-spacer"></div>
            <div class="controls">
                <button :class="{active: alwaysOnTop}" ref="aot" title="Toggle always on top" @click="toggleaot">P</button>
                <button title="Close CSS Editor" @click="close">X</button>
            </div>
        </div>
        <div id="spinner" v-if="loading">
            <div class="valign">Loading Please Wait...</div>
        </div>
        <div id="editor" class="editor">
            <codemirror ref="mycm" :options="cmOptions" @input="cmOnChange" />
        </div>
        <div class="parser-error" v-if="error">{{ error.formatted }}</div>
        <div class="tools">
            <div class="flex-row">
                <button @click="save">Save</button>
                <button @click="update">Update</button>
                <div class="flex-spacer"></div>
                <div id="chkboxLiveUpdate">
                    <label><input type="checkbox" @click="toggleLiveUpdate" v-model="liveUpdate" /><span>Live Update</span></label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ClientIPC from 'bdipc';

    import { remote } from 'electron';

    import 'codemirror/addon/scroll/simplescrollbars.js';
    import 'codemirror/mode/css/css.js';
    import 'codemirror/addon/hint/css-hint.js';
    import 'codemirror/addon/search/search.js';
    import 'codemirror/addon/search/searchcursor.js';
    import 'codemirror/addon/search/jump-to-line.js';
    import 'codemirror/addon/dialog/dialog.js';
    import 'codemirror/addon/hint/show-hint.js';

    const ExcludedIntelliSenseTriggerKeys = {
        '8': 'backspace',
        '9': 'tab',
        '13': 'enter',
        '16': 'shift',
        '17': 'ctrl',
        '18': 'alt',
        '19': 'pause',
        '20': 'capslock',
        '27': 'escape',
        '33': 'pageup',
        '34': 'pagedown',
        '35': 'end',
        '36': 'home',
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down',
        '45': 'insert',
        '46': 'delete',
        '91': 'left window key',
        '92': 'right window key',
        '93': 'select',
        '107': 'add',
        '109': 'subtract',
        '110': 'decimal point',
        '111': 'divide',
        '112': 'f1',
        '113': 'f2',
        '114': 'f3',
        '115': 'f4',
        '116': 'f5',
        '117': 'f6',
        '118': 'f7',
        '119': 'f8',
        '120': 'f9',
        '121': 'f10',
        '122': 'f11',
        '123': 'f12',
        '144': 'numlock',
        '145': 'scrolllock',
        '186': 'semicolon',
        '187': 'equalsign',
        '188': 'comma',
        '189': 'dash',
        '190': 'period',
        '191': 'slash',
        '192': 'graveaccent',
        '220': 'backslash',
        '222': 'quote'
    };

    export default {
        data() {
            return {
                loading: true,
                codeMirror: null,
                alwaysOnTop: false,
                liveUpdate: false,
                cmOptions: {
                    indentUnit: 4,
                    tabSize: 4,
                    mode: 'text/x-scss',
                    lineNumbers: true,
                    theme: 'material',
                    scrollbarStyle: 'overlay',
                    extraKeys: {
                        'Ctrl-Space': 'autocomplete'
                    },
                    dialog: {
                        'position': 'bottom'
                    }
                },
                error: null
            }
        },
        computed: {
            codemirror() {
                return this.$refs.mycm.codemirror;
            },
            CodeMirror() {
                return this.$refs.mycm;
            }
        },
        created() {
            ClientIPC.on('set-scss', (_, scss) => this.setScss(scss));

            ClientIPC.on('scss-error', (_, err) => {
                this.error = err;
                this.$forceUpdate();
                if (err)
                    console.error('SCSS parse error:', err);
            });

            ClientIPC.on('set-liveupdate', (e, liveUpdate) => this.liveUpdate = liveUpdate);
        },
        mounted() {
            this.codemirror.on('keyup', this.cmOnKeyUp);

            (async () => {
                this.setScss(await ClientIPC.sendToDiscord('get-scss'));
                this.liveUpdate = await ClientIPC.sendToDiscord('get-liveupdate');
            })();
        },
        watch: {
            liveUpdate(liveUpdate) {
                ClientIPC.sendToDiscord('set-liveupdate', liveUpdate);
            }
        },
        methods: {
            save() {
                const scss = this.codemirror.getValue();
                ClientIPC.sendToDiscord('save-scss', scss);
            },
            update() {
                const scss = this.codemirror.getValue();
                ClientIPC.sendToDiscord('update-scss', scss);
            },
            toggleaot() {
                this.alwaysOnTop = !this.alwaysOnTop;
                remote.getCurrentWindow().setAlwaysOnTop(this.alwaysOnTop);
            },
            close() {
                window.close();
            },
            setScss(scss) {
                this.loading = false;
                this.codemirror.setValue(scss || '');
            },
            cmOnChange(value) {
                if(this.liveUpdate) ClientIPC.sendToDiscord('update-scss', value);
            },
            cmOnKeyUp(editor, event) {
                if (event.ctrlKey) return;
                if (ExcludedIntelliSenseTriggerKeys[event.keyCode]) return;
                cmCommands.autocomplete(editor, null, { completeSingle: false });
            },
            toggleLiveUpdate(e) {
                this.liveUpdate = !this.liveUpdate;
            }
        }
    }
</script>
