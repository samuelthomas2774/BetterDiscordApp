/**
 * BetterDiscord Emote Autocomplete Module
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { Settings } from 'modules';

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
        const acType = Settings.getSetting('emotes', 'default', 'emoteactype').value;
        if (regex.length <= 0) {
            return {
                type: 'imagetext',
                title: [`Your ${acType ? 'most used' : 'favourite'} emotes`, '', `⬅ ${acType ? 'Favourites' : 'Most Used'} ⮕`],
                items: EmoteModule[acType ? 'mostUsed' : 'favourites'].sort((a, b) => b.useCount - a.useCount).map(mu => {
                    return {
                        key: acType ? mu.key : mu.name,
                        value: {
                            src: EMOTE_SOURCES[mu.type].replace(':id', mu.id),
                            replaceWith: `;${acType ? mu.key : mu.name};`,
                            hint: mu.useCount ? `Used ${mu.useCount} times` : null
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

    toggle(sterm) {
        if (sterm.length > 1) return false;
        Settings.getSetting('emotes', 'default', 'emoteactype').value = !Settings.getSetting('emotes', 'default', 'emoteactype').value;
        return true;
    }

}
