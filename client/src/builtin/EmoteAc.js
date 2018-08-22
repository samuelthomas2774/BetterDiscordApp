/**
 * BetterDiscord Emote Autocomplete Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import BuiltinModule from './BuiltinModule';
import EmoteModule from './EmoteModule';
import GlobalAc from '../ui/autocomplete';

const EMOTE_SOURCES = [
    'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0',
    'https://cdn.frankerfacez.com/emoticon/:id/1',
    'https://cdn.betterttv.net/emote/:id/1x'
]

export default new class EmoteAc extends BuiltinModule {

    get settingPath() { return ['emotes', 'default', 'emoteac'] }

    async enabled(e) {
        GlobalAc.add(';', this);
    }

    disabled(e) {
        GlobalAc.remove(';');
    }

    /**
     * Search for autocomplete
     * @param {any} regex
     */
    acsearch(regex) {
        if (regex.length <= 0) {
            return {
                type: 'imagetext',
                title: ['Your most used emotes'],
                items: EmoteModule.mostUsed.sort((a, b) => b.useCount - a.useCount).slice(0, 10).map(mu => {
                    return {
                        key: `${mu.key} | ${mu.useCount}`,
                        value: {
                            src: EMOTE_SOURCES[mu.type].replace(':id', mu.id),
                            replaceWith: `;${mu.key};`
                        }
                    }
                })
            }
        }

        const results = EmoteModule.search(regex);
        return {
            type: 'imagetext',
            title: ['Matching', regex.length],
            items: results.map(result => {
                result.value.src = EMOTE_SOURCES[result.value.type].replace(':id', result.value.id);
                result.value.replaceWith = `;${result.key};`;
                return result;
            })
        }
    }

}
