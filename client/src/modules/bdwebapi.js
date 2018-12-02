/**
 * BetterDiscord Web Apis
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { request } from 'vendor';

const APIBASE = 'ifyouareinwebtestthenyouknowwhatthisshouldbe'; // Do not push
const ENDPOINTS = {
    'themes': `${APIBASE}/themes`,
    'theme': id => `${APIBASE}/theme/${id}`,
    'users': `${APIBASE}/users`,
    'user': id => `${APIBASE}/user/${id}`,
    'statistics': `${APIBASE}/statistics`
};

const dummyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
const dummyRepo = {
    name: 'ExampleRepository',
    baseUri: 'https://github.com/Jiiks/ExampleRepository',
    rawUri: 'https://github.com/Jiiks/ExampleRepository/raw/master'
};
const dummyVersion = () => `${Math.round(Math.random() * 3)}.${Math.round(Math.random() * 10)}.${Math.round(Math.random() * 10)}`;
const dummyFiles = {
    readme: 'Example/readme.md',
    previews: [{
        large: 'Example/preview1-big.png',
        thumb: 'Example/preview1-small.png'
    }]
};
const dummyAuthor = 'DummyAuthor';
const dummyTimestamp = () => `2018-${Math.floor((Math.random() * 12) + 1).toString().padStart(2, '0')}-${Math.floor((Math.random() * 30) + 1).toString().padStart(2, '0')}T14:51:32.057Z`;

async function dummyThemes() {
    // Simulate get
    await new Promise(r => setTimeout(r, Math.random() * 3000));
    const dummies = [];
    for (let i = 0; i < 10; i++) {
        dummies.push({
            id: `theme${i}${btoa(Math.random()).substring(3, 9)}`,
            name: `Dummy ${i}`,
            tags: dummyTags,
            installs: Math.floor(Math.random() * 10000),
            updated: dummyTimestamp(),
            rating: Math.floor(Math.random() * 1000),
            activeUsers: Math.floor(Math.random() * 1000),
            rated: Math.random() > .5,
            version: dummyVersion(),
            repository: dummyRepo,
            files: dummyFiles,
            author: dummyAuthor
        });
    }
    return {
        docs: dummies,
        pagination: {
            total: 25,
            pages: 3,
            limit: 9,
            page: 1
        }
    };
}

export default class BdWebApi {

    static get themes() {
        return {
            get: this.getThemes
        };
    }

    static get users() {
        return {
            get: this.getUsers
        };
    }

    static get statistics() {
        return {
            get: this.getStatistics,
            patch: this.patchStatistics
        };
    }

    static getThemes(args) {
        return dummyThemes();
        /*
        if (!args) return request.get(ENDPOINTS.themes);
        const { id } = args;
        if (id) return request.get(ENDPOINTS.theme(id));

        return request.get(ENDPOINTS.themes);
        */
    }

    static getUsers(args) {
        if (!args) return request.get(ENDPOINTS.users);
        const { id } = args;
        if (id) return request.get(ENDPOINTS.user(id));

        return request.get(ENDPOINTS.users);
    }

    static getStatistics() {
        return request.get(ENDPOINTS.statistics);
    }

    static patchStatistics(json) {
        return request({ method: 'PATCH', url: ENDPOINTS.statistics, json });
    }
}
