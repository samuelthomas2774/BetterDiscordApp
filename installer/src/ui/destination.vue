<template>
    <div class="content-block destination-block">
        <h3>Destination</h3>
        <div class="separator"></div>
        <div class="input-group">
            <span>Discord Path</span>
            <div class="flex-horizontal">
                <input type="text" name="installpath" readonly :value="paths[channel].latest"/>
                <button @click="$emit('askForDiscordPath')">Change</button>
            </div>
            <div class="radio-group">
                <label for="stable">
                    <input @change="channelChange" id="stable" name="channel" type="radio" value="stable" :checked="channel === 'stable'" />
                    Stable
                </label>
                <label for="ptb">
                    <input @change="channelChange" id="ptb" name="channel" type="radio" value="ptb" :checked="channel === 'ptb'" />
                    PTB
                </label>
                <label for="canary">
                    <input @change="channelChange" id="canary" name="channel" type="radio" value="canary" :checked="channel === 'canary'" />
                    Canary
                </label>
            </div>
            <div class="separator"></div>
            <span>BetterDiscord Path</span>
            <div class="flex-horizontal">
                <input type="text" name="installpath" :value="dataPath" readonly />
                <button @click="$emit('askForDataPath')">Change</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['paths', 'channel', 'dataPath'],
        methods: {
            channelChange(e) {
                const { value } = e.target;
                this.$emit('setChannel', value);
            }
        }
    }
</script>
