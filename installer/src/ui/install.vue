<template>
    <div class="content-block install-block">
        <h3>Installing BetterDiscord</h3>
        <div class="separator"></div>
        <textarea readonly :value="ta" ref="log" />
        <div class="progress" :class="{'progress-done': done, 'progress-err': error}">
            <div class="progress-spacer"></div>
            <div v-if="!done" class="progress-bounce"></div>
        </div>
    </div>
</template>

<script>
    import { ipcRenderer as ipc } from 'electron';

    export default {
        data() {
            return {
                lines: []
            };
        },
        props: ['paths', 'dataPath', 'channel', 'done', 'error'],
        computed: {
            ta() {
                return this.lines.join('\r\n');
            }
        },
        methods: {
            async addLine(text) {
                console.log('Install progress:', text);
                this.lines.push(text);
                await this.$nextTick();
                this.$refs.log.scrollTop = this.$refs.log.scrollHeight;
            },
            async retry() {
                this.$emit('started');

                try {
                    ipc.send('install', {
                        paths: this.paths,
                        dataPath: this.dataPath,
                        channel: this.channel
                    });
                } catch (err) {
                    this.addLine(err.message);
                    console.error(err);
                }
            },
            ipcAddLine(e, message) {
                this.addLine(message);
            },
            ipcDone(e) {
                this.addLine();
                this.$emit('done');
            },
            ipcError(e, err) {
                this.addLine();
                this.$emit('error', err);
            }
        },
        created() {
            ipc.on('appendlog', this.ipcAddLine);
            ipc.on('installdone', this.ipcDone);
            ipc.on('installerror', this.ipcError);
        },
        destroyed() {
            ipc.removeListener('appendlog', this.ipcAddLine);
            ipc.removeListener('installdone', this.ipcDone);
            ipc.removeListener('installerror', this.ipcError);
        },
        mounted() {
            setTimeout(() => {
                this.retry();
            }, 1000); // Wait for animation to finish
        }
    }
</script>
