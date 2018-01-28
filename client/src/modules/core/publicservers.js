/**
 * BetterDiscord Public Server List
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { shell } = require('electron');
const $ = require('jquery');
const Vue = require('vue').default;
const InjectorKit = require('injectorkit');

const { WebpackModules } = require('./webpackmodules');
const InviteActions = WebpackModules.getModuleByName('InviteActions');

const { PublicServersAPI } = require('./publicserversapi');

const PublicServersList = require('../ui/components/publicservers/PublicServersList.vue').default;

const createjoin_panel = `<div class="action join bd-public">
    <div class="action-header">Public</div>
    <div class="action-body">Find a public server from discordservers.com.</div>
    <div class="action-icon"></div>
    <button class="btn btn-primary bd-button" type="button">Find a Server</button>
</div>`;

const injectorkit = new InjectorKit('publicservers');
injectorkit.start();

var pinned_servers = [];

class PublicServers {

    constructor() {
        this.pinned_servers = [this.bd_server, this.test_server];

        this.$createjoin_panel = $(createjoin_panel).attr('id', 'publicservertest-panel');
        this.$createjoin_or = $('<div></div>').attr('id', 'publicservertest-or').addClass('bd-public-or or').text('or');
        this.$join_panel = $('<div></div>').attr('id', 'bd-public-servers-root');
        // this.$join_panel = $(this.vueInstance.$el);

        this.$join_panel_mount = $('<div></div>').appendTo(this.$join_panel).css('transform', 'translateX(100%)');
        this.vueInstance = new Vue({
            el: this.$join_panel_mount[0],
            components: { PublicServersList },
            methods: {
                back: () => this.unfocusServers(),
                search: () => this.queryChanged(),
                more: () => this.loadAdditionalResults(),
                join: server => this.joinServer(server),
                openLink: e => shell.openExternal(e.target.href)
            },
            template: '<PublicServersList />'
        });
        this.vue = this.vueInstance.$children[0];
        this.vue.pinned_servers = this.pinned_servers;

        this.$createjoin_panel_button = this.$createjoin_panel.on('click', () => this.focusServers()).find('.btn-primary');

        // this.$public_server_list = this.$join_panel.find('.bd-public-list');
        // this.$join_panel_back_button = this.$join_panel.find('.bd-public-back').on('click', () => this.unfocusServers());

        this.panel_injection = this.injectorkit.get('modal-addserver-createjoin').callback((injection, $element) => {
            // Add server modal was opened
            $element.find('.action.join').after(this.$createjoin_panel);
            $element.find('.form-inner').addBack().css('width', '764px').parents('.create-guild-container').css('width', '764px').css({
                transition: 'width 0.2s ease'
            });
            $element.parent().css('height', '100%').parent().css('transition', 'height 0.2s ease').css('height', '420px');

            this.$createjoin_panel.next().css('width', '520px').after(this.$createjoin_or);

            this.$createjoin_panel.prev().prev().addBack().on('click', () => {
                $element.parents('.create-guild-container').css('width', '');
            });
        }, (injection, $element) => {
            // Remove injection - this does *not* mean the add server modal was closed
            $element.parents('.create-guild-container').addBack().find('.form-inner').addBack().css('width', '');
            $element.attr('style', 'transform: translateX(0%) translateZ(0%);');
            $element.parent().parent().css('height', '420px');
            this.$createjoin_panel.detach();
            this.$createjoin_or.detach();
            this.$join_panel.detach();
        });
    }

    focusServers() {
        this.$createjoin_panel.parents('.create-or-join').after(this.$join_panel).css({
            transition: 'transform 0.2s ease',
            transform: 'translateX(-100%)'
        });
        // 1 millisecond should be enough time to place the panel 100% off so this animates
        setTimeout(() => this.$join_panel.css('transform', 'translateX(0%)'), 1);
        this.$join_panel.parent().parent().css('height', '100%');
        this.serversFocused();
    }

    serversFocused() {
        console.log('Opened the servers list');

        this.loadResults();
    }

    async loadResults(category, query, from) {
        this.vue.loaded = false;
        const response = await PublicServersAPI.getSearchResults({
            category: category || '',
            query: query || '',
            from: from || 0
        });

        this.vue.loaded = true;
        this.vue.servers = response.results;
        this.vue.category = category;
        this.vue.query = query;
        this.vue.info = {
            from: response.from,
            size: response.size,
            time: response.time,
            total: response.total,
            current: response.current,
            next: response.next,

            first_item: response.from + 1,
            last_item: response.from + response.size,
            more_available: (response.from + response.size) < response.total
        };
    }

    async loadAdditionalResults(category, query, from) {
        this.vue.loaded = false;
        const response = await PublicServersAPI.getSearchResults({
            category: category || this.vue.category,
            query: query || this.vue.query,
            from: from || this.vue.info.last_item
        });

        this.vue.loaded = true;
        this.vue.servers = this.vue.servers.concat(response.results);
        this.vue.info = {
            from: this.vue.info.from,
            size: this.vue.info.size + response.size,
            time: this.vue.info.time + response.time,
            total: response.total,
            current: this.vue.info.current,
            next: response.next,

            first_item: response.from + 1,
            last_item: response.from + response.size,
            more_available: (response.from + response.size) < response.total
        };
    }

    queryChanged() {
        const category = this.vue.$refs.category.value;
        const query = this.vue.$refs.search_query.value;
        console.log(category, query);
        this.loadResults(category, query);
        return false;
    }

    joinServer(server) {
        InviteActions.acceptInviteAndTransitionToInviteChannel(server.invite_code);
        WebpackModules.getModuleByProps(['open', 'close', 'createGuild']).close();
    }

    unfocusServers() {
        this.$createjoin_panel.parents('.create-or-join').css('transform', 'translateX(0%)');
        this.$join_panel.css('transform', 'translateX(100%)');
        this.$join_panel.parent().parent().css('height', '420px');

        setTimeout(() => {
            this.$createjoin_panel.parents('.create-or-join').css('transition', 'none').css('transform', 'translateX(0%) translateZ(0%)');
            this.serversUnfocused();
            this.$join_panel.detach();
        }, 200);
    }

    serversUnfocused() {
        console.log('Closed the servers list');
    }

    get pinned_servers() {
        return pinned_servers;
    }

    set pinned_servers(servers) {
        pinned_servers = servers;

        if (this.vue)
            this.vue.pinned_servers = servers;
    }

    get bd_server() {
        return {
            identifier: 1,
            name: 'BetterDiscord',
            score: 1,
            boost: 1,
            events: 1,
            members: null,
            online: null,
            enabled: true,
            nsfw: false,
            listed: true,
            has_bot: true,
            owner: 1,
            description: 'Main BetterDiscord server.',
            region: null,
            icon: 'https://cdn.discordapp.com/icons/86004744966914048/c8d49dc02248e1f55caeb897c3e1a26e.png',
            insert_date: '2018-01-27',
            modified_date: '2018-01-27',
            categories: [
                'community',
                'programming',
                'support'
            ],
            keywords: [],
            invite_code: '0Tmfo5ZbORCRqbAd',
            subscription: ''
        };
    }

    get test_server() {
        return {
            identifier: 2,
            name: 'PSL Test',
            score: 1,
            boost: 1,
            events: 1,
            members: 0,
            online: 0,
            enabled: true,
            nsfw: false,
            listed: true,
            has_bot: true,
            owner: 1,
            description: 'Server for testing the public server list.',
            region: 'eu-west',
            icon: 'https://cdn.discordapp.com/icons/86004744966914048/c8d49dc02248e1f55caeb897c3e1a26e.png',
            insert_date: '2018-01-27',
            modified_date: '2018-01-27',
            categories: [],
            keywords: [],
            invite_code: 'cP7j577',
            subscription: ''
        }
    }

    get injectorkit() {
        return injectorkit;
    }

    get api() {
        return PublicServersAPI;
    }

}

const instance = new PublicServers();
module.exports = { PublicServers: instance };
window.PublicServers = instance;
