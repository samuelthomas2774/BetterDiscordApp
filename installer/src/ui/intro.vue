<template>
    <div class="content-block introduction-block">
        <h3>Welcome to the BetterDiscord setup</h3>
        <div className="separator"></div>
        <span>The setup will install BetterDiscord on your computer.</span>
        <span>Click "Next" to continue or "Cancel" to exit the setup.</span>
        <span>For support join the official BetterDiscord <a href="https://v2.betterdiscord.net/discord/support" @click="openLink">#support</a> channel in Discord</span>
    </div>
</template>

<script>
    import electron from 'electron';

    export default {
        methods: {
            openLink(e) {
                electron.shell.openExternal(e.target.href);
                e.preventDefault();
            }
        }
    }
</script>
