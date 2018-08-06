/**
 * BetterDiscord Connectivity Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BdWebApi from './bdwebapi';
import { ClientLogger as Logger } from 'common';

const APIBASE = 'ifyouareinwebtestthenyouknowwhatthisshouldbe'; // Do not push
const ENDPOINTS = {
    'themes': `${APIBASE}/themes`,
    'users': `${APIBASE}/users`
};

export default class Connectivity {

    static start() {
        Logger.info('Connectivity', `Patching anonymous statistics`);
        BdWebApi.patchStatistics({ themes: [], plugins: [] });
        setInterval(() => {
            Logger.info('Connectivity', `Patching anonymous statistics`);
            BdWebApi.patchStatistics({ themes: [], plugins: [] });
        }, 15*60*1000);
    }

}
