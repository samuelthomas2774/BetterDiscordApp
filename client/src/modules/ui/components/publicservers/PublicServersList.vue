<template src="./templates/PublicServersList.html"></template>
<script>
    import ScrollerWrap from '../generic/ScrollerWrap.vue';
    import Server from './Server.vue';

    const components = { ScrollerWrap, Server };

    export default {
        components,
        data() {
            return {
                loaded: false,
                message: null,
                servers: [],
                pinned_servers: [],
                category: '',
                query: '',
                info: {
                    from: 0,
                    size: 0,
                    time: 0,
                    total: 0,
                    current: '',
                    next: '',

                    first_item: 1,
                    last_item: 0,
                    more_available: false
                },
                categories: {
                    'Games': {
                        'fps games': "FPS",
                        'mmo games': "MMO",
                        'strategy games': "Strategy",
                        'sports games': "Sports",
                        'puzzle games': "Puzzle",
                        'retro games': "Retro",
                        'party games': "Party",
                        'tabletop games': "Tabletop",
                        'sandbox games': "Sandbox",
                        'simulation games': "Simulation"
                    },
                    'Other': {
                        'community': "Community",
                        'language': "Language",
                        'programming': "Programming",
                        'other': "Other"
                    }
                }
            };
        }
    }
</script>
