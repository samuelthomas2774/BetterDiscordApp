<template>
    <div id="mount">
        <div class="root">
            <div class="modal"></div>
            <div class="titleBar">
                <div class="logo"></div>
                <span>BetterDiscord Setup</span>
            </div>
            <div class="content-container" :class="{animating, 'animating-reverse': animatingr}">
                <div class="bg-logo"></div>
                <Sidebar :activeIndex="selectedIndex" version="2.0.0" />
                <div class="content">
                    <Intro v-if="selectedPanel === 0" />
                    <License v-if="selectedPanel === 1" />
                    <Destination v-if="selectedPanel === 2" :paths="paths" :channel="currentChannel" @setChannel="setChannel" @askForDiscordPath="askForDiscordPath" :dataPath="dataPath" @askForDataPath="askForDataPath" />
                </div>
                <div class="separator-controls"></div>
                <div class="controls">
                    <template v-if="selectedPanel === 0">
                        <button @click="next">Next</button>
                    </template>
                    <template v-if="selectedPanel === 1">
                        <button @click="back">Back</button>
                        <button @click="next">I Agree</button>
                    </template>
                    <template v-if="selectedPanel === 2">
                        <button @click="back">Back</button>
                        <button class="disabled">Install</button>
                    </template>
                    <button @click="cancel">Cancel</button>
                </div>
                <div class="border" v-if="platform === 'win32'"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import Sidebar from './sidebar.vue';
    import Intro from './intro.vue';
    import License from './license.vue';
    import Destination from './destination.vue';

    import electron from 'electron';
    import process from 'process';
    import path from 'path';
    import fs from 'fs';

    function checkDir(dir) {
        if (dir === null) return false;
        try {
            fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
            return true;
        } catch (err) {
            return false;
        }
    }

    function findLatest(basePath) {
        const dirs = fs.readdirSync(basePath).map(dir => {
            return {
                dir,
                path: path.join(basePath, dir)
            }
        }).filter(d => {
            return d.dir.match(/^\d\./) && fs.statSync(d.path).isDirectory();
        });

        if (dirs.length === 1) return dirs[0].path;
        let latest = null;
        for (let d of dirs) {
            if (!latest) {
                latest = d.dir;
                continue;
            }
            if (d > latest) latest = d;
        }
        return latest.path;
    }

    function resolvePaths() {
        const userPath = electron.remote.app.getPath('appData');
        const paths = {
            stable: {
                base: path.join(userPath, 'discord')
            },
            ptb: {
                base: path.join(userPath, 'discordptb')
            },
            canary: {
                base: path.join(userPath, 'discordcanary')
            }
        };
        paths.stable.latest = findLatest(paths.stable.base);
        paths.ptb.latest = findLatest(paths.ptb.base);
        paths.canary.latest = findLatest(paths.canary.base);

        paths.stable.writable = checkDir(paths.stable.latest);
        paths.ptb.writable = checkDir(paths.ptb.latest);
        paths.canary.writable = checkDir(paths.canary.latest);
        console.log(paths);
        return paths;
    }

    function resolveDataPath() {
        const userPath = electron.remote.app.getPath('appData');
        return path.join(userPath, 'BetterDiscord');
    }

    export default {
        data() {
            return {
                selectedIndex: 2,
                selectedPanel: 2,
                animating: false,
                animatingr: false,
                paths: {},
                currentChannel: 'stable',
                dataPath: ''
            }
        },
        props: ['platform'],
        components: {
            Sidebar,
            Intro,
            License,
            Destination
        },
        methods: {
            next() {
                if (this.animating || this.animatingr) return;
                const active = this.selectedIndex + 1;
                this.animating = true;
                this.selectedIndex = active;
                setTimeout(() => {
                    this.selectedPanel = active;
                    setTimeout(() => {
                        this.animating = false;
                    }, 500);
                }, 500);
            },
            back() {
                if (this.animating || this.animatingr) return;
                const active = this.selectedIndex - 1;
                this.animatingr = true;
                this.selectedIndex = active;
                setTimeout(() => {
                    this.selectedPanel = active;
                    setTimeout(() => {
                        this.animatingr = false;
                    }, 500);
                }, 500);
            },
            cancel() {},
            setChannel(channel) {
                console.log(`Channel Set To: ${channel}`);
                this.currentChannel = channel;
            },
            askForPath(current) {
                return new Promise((resolve, reject) => electron.remote.dialog.showOpenDialog(electron.remote.getCurrentWindow(), {
                    defaultPath: current,
                    buttonLabel: 'Select',
                    properties: [
                        'openDirectory',
                        'showHiddenFiles',
                        'treatPackageAsDirectory'
                    ]
                }, filenames => {
                    filenames && filenames.length === 1 ? resolve(filenames[0]) : reject(filenames);
                }));
            },
            async askForDiscordPath() {
                const path = await this.askForPath(this.paths[this.currentChannel].latest);
                this.paths.user = {
                    latest: path,
                    writable: checkDir(path)
                };
                console.log('Channel Set To: user');
                this.currentChannel = 'user';
            },
            async askForDataPath() {
                const path = await this.askForPath(this.dataPath);
                this.dataPath = path;
            }
        },
        beforeMount() {
            this.paths = resolvePaths();
            this.dataPath = resolveDataPath();
        }
    }
</script>
