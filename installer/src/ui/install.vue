<template>
    <div class="content-block install-block">
        <h3>Installing BetterDiscord</h3>
        <div class="separator"></div>
        <textarea readonly :value="ta" ref="log"/>
        <div class="progress">
            <div class="progress-spacer"></div>
            <div class="progress-bounce"></div>
        </div>
    </div>
</template>

<script>
    import electron from 'electron';
    const ipc = electron.ipcRenderer;

    export default {
        data() {
            return {
                lines: []
            }
        },
        props: ['paths', 'dataPath', 'channel'],
        computed: {
            ta() {
                return this.lines.join('\r\n')
            }
        },
        methods: {
            addLine(text) {
                this.lines.push(text);
                setTimeout(() => {
                    this.$refs.log.scrollTop = this.$refs.log.scrollHeight;
                }, 50);
            }
        },
        mounted() {
            setTimeout(() => {
                ipc.on('appendlog', (e, message) => {
                    this.lines.push(message);
                });

                ipc.on('installdone', e => {

                });

                (async () => {
                    try {
                        ipc.send('install', {
                            paths: this.paths,
                            dataPath: this.dataPath,
                            channel: this.channel
                        });
                    } catch (err) {
                        this.addLine(err.message);
                        console.error(err);
                        return;
                    }
                })();
            }, 1000); // Wait for animation to finish
        }
    }
</script>
