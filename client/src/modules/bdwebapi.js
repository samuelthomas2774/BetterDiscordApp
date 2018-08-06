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
    'users': `${APIBASE}/users`,
    'statistics': `${APIBASE}/statistics`
};

export default class BdWebApi {

    static async getThemes() {
        const get = await request.get(ENDPOINTS.themes);
        return JSON.parse(get);
    }

    static async getUsers() {
        const get = await request.get(ENDPOINTS.users);
        return get;
    }

    static async patchStatistics(json) {
        return await request({ method: 'PATCH', url: ENDPOINTS.statistics, json });
    }
}
