/**
 * BetterDiscord Autocomplete Component
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

<template>
    <div class="bd-autocomplete">
        <div class="bd-autocomplete-inner">
            <div class="bd-autocompleteRow">
                <div class="bd-autocompleteSelector">
                    <div class="bd-autocompleteTitle">
                        Emotes Matching:
                        <strong>Kappa</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import EmoteModule from '../../../builtin/Emotemodule.js';
    export default {
        props: ['title', 'emotes'],
        beforeMount() {
            console.log(EmoteModule);
        }
    }
</script>
