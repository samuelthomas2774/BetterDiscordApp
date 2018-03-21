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
    import github from 'github-api';
    const Github = new github();
    let lines = [
        'Fetching latest release info'
    ];

    Github.getLatestRelease = async function (user, repo) {
        try {
            const get = await this.getRepo(user, repo).getRelease('latest');
            return get.data;
        } catch (err) {
            throw err;
        }
    }
    export default {
        data() {
            return {
                lines: ['Fetching latest release info']
            }
        },
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
            ipc.on('dlcomplete', (e, dl) => {
                if (dl.err) {
                    console.log(dl);
                    return;
                }
                this.lines.push(`Finished downloading latest release`);
                console.log(dl);
            });
            (async () => {
                try {
                    const latest = await Github.getLatestRelease('JsSucks', 'BetterDiscordApp');
                    this.addLine(`Using release: ${latest.id}`);
                    this.addLine('Verifying assets');
                    const fullpkg = latest.assets.find(asset => asset.name.includes('full'));
                    if (!fullpkg) {
                        this.addLine('Release does not contain full package! Unable to continue');
                        return;
                    }
                    this.addLine(`Using release asset: ${fullpkg.id}`);
                    this.addLine('Downloading latest release...');
                   // ipc.send('ghdl', { filename: 'betterdiscord.zip', url: fullpkg.url });
                } catch (err) {
                    this.addLine(err.message);
                    console.error(err);
                    return;
                }
            })();
        }
    }
</script>
