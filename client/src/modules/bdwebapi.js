/**
 * BetterDiscord Web Apis
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import ServerEmu from '../dev/serveremu';

import { request } from 'vendor';

const APIBASE = 'ifyouareinwebtestthenyouknowwhatthisshouldbe'; // Do not push
const ENDPOINTS = {
    'themes': `${APIBASE}/themes`,
    'theme': id => `${APIBASE}/theme/${id}`,
    'users': `${APIBASE}/users`,
    'user': id => `${APIBASE}/user/${id}`,
    'statistics': `${APIBASE}/statistics`
};

export default class BdWebApi {

    static get themes() {
        return {
            get: this.getThemes
        };
    }

    static get plugins() {
        return {
            get: this.getPlugins
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
        return ServerEmu.themes(args);
        //  return dummyThemes();
        /*
        if (!args) return request.get(ENDPOINTS.themes);
        const { id } = args;
        if (id) return request.get(ENDPOINTS.theme(id));

        return request.get(ENDPOINTS.themes);
        */
    }

    static getPlugins(args) {
        return ServerEmu.plugins(args);
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
