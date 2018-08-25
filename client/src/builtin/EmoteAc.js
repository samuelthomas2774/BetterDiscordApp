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
import { BdContextMenu } from 'ui';

const EMOTE_SOURCES = [
    'https://static-cdn.jtvnw.net/emoticons/v1/:id/1.0',
    'https://cdn.frankerfacez.com/emoticon/:id/1',
    'https://cdn.betterttv.net/emote/:id/1x'
]

export default new class EmoteAc extends BuiltinModule {

    /* Getters */
    get moduleName() { return 'EmoteAC' }
    get settingPath() { return ['emotes', 'default', 'emoteac'] }

    async enabled(e) {
        GlobalAc.add(';', this);
        window.removeEventListener('contextmenu', this.acCm);
        window.addEventListener('contextmenu', this.acCm);
    }

    disabled(e) {
        GlobalAc.remove(';');
        window.removeEventListener('contextmenu', this.acCm);
    }

    /* Methods */
    acCm(e) {
        const row = e.target.closest('.bd-emotAc');
        if (!row) return;
        const img = row.querySelector('img');
        if (!img || !img.alt) return;

        BdContextMenu.show(e, [
            {
                text: 'Test',
                items: [
                    {
                        text: 'Favourite',
                        type: 'toggle',
                        checked: EmoteModule.isFavourite(img.alt.replace(/;/g, '')),
                        onChange: checked => {
                            if (!img || !img.alt) return;
                            const emote = img.alt.replace(/;/g, '');
                            if (!checked) return EmoteModule.removeFavourite(emote), false;
                            return EmoteModule.addFavourite(emote), true;
                        }
                    }
                ]
            }
        ]);
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
                }),
                extraClasses: ['bd-emotAc']
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
            }),
            extraClasses: ['bd-emotAc']
        }
    }

    toggle(sterm) {
        if (sterm.length > 1) return false;
        Settings.getSetting('emotes', 'default', 'emoteactype').value = !Settings.getSetting('emotes', 'default', 'emoteactype').value;
        return true;
    }

}
