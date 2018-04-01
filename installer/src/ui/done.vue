<template>
    <div class="content-block introduction-block">
        <h3>BetterDiscord has been installed</h3>
        <div className="separator"></div>
        <span>BetterDiscord has been installed on your computer. To start using it, completely close Discord and then start it again.</span>
        <span>Click "Close" to exit the setup.</span>
        <span>For support join the official BetterDiscord <a href="https://v2.betterdiscord.net/discord/support" @click="openLink">#support</a> channel on Discord.</span>
    </div>
</template>

<script>
    import { shell } from 'electron';

    export default {
        methods: {
            openLink(e) {
                shell.openExternal(e.target.href);
                e.preventDefault();
            }
        }
    }
</script>
