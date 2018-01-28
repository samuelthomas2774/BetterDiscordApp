/**
 * BetterDiscord Public Server List
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const querystring = require('querystring');

const $ = require('jquery');

class PublicServersAPI {

    async getSearchResults(query) {
        const queryString = querystring.stringify(query || {});

        let results = [];

        await $.ajax({
            method: 'GET',
            url: `${this.endPoint}/?${queryString}`,
            success: response => {
                console.log('Public server API response for', queryString, response);
                results = response;
                /*results = {
                    results: [
                        {
                            identifier: 1,
                            name: 'BetterDiscord',
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
                            description: 'Main BetterDiscord server.',
                            region: 'vip-us-west',
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
                        },
                        {
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
                            description: 'Server for testing the public server list',
                            region: 'vip-us-west',
                            icon: 'https://cdn.discordapp.com/icons/86004744966914048/c8d49dc02248e1f55caeb897c3e1a26e.png',
                            insert_date: '2018-01-27',
                            modified_date: '2018-01-27',
                            categories: [
                                'community',
                                'programming',
                                'support'
                            ],
                            keywords: [],
                            invite_code: 'cP7j577',
                            subscription: ''
                        }
                    ],
                    from: 0,
                    size: 2,
                    time: 0,
                    total: 2,
                    current: '',
                    next: ''
                };/**/
            },
            error: jqXHR => {
                console.log(jqXHR);
                alert('Failed to load servers. Check console for details.');
            }
        });

        return results;
    }

    get endPoint() {
        return 'https://search.discordservers.com';
    }

    get joinEndPoint() {
        return 'https://join.discordservers.com';
    }

    get connectEndPoint() {
        return 'https://join.discordservers.com/connect';
    }

}

const instance = new PublicServersAPI();
module.exports = { PublicServersAPI: instance };
