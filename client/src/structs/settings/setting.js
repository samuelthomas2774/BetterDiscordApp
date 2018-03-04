/**
 * BetterDiscord Setting Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Utils } from 'common';

import BoolSetting from './types/bool';
import StringSetting from './types/text';
import NumberSetting from './types/number';
import DropdownSetting from './types/dropdown';
import RadioSetting from './types/radio';
import SliderSetting from './types/slider';
import ColourSetting from './types/colour';
import FileSetting from './types/file';
import ArraySetting from './types/array';
import CustomSetting from './types/custom';

export default class Setting {

    constructor(args) {
        args = args.args || args;

        if (args.type === 'color') args.type = 'colour';

        if (args.type === 'bool') return new BoolSetting(args);
        else if (args.type === 'text') return new StringSetting(args);
        else if (args.type === 'number') return new NumberSetting(args);
        else if (args.type === 'dropdown') return new DropdownSetting(args);
        else if (args.type === 'radio') return new RadioSetting(args);
        else if (args.type === 'slider') return new SliderSetting(args);
        else if (args.type === 'colour') return new ColourSetting(args);
        else if (args.type === 'file') return new FileSetting(args);
        else if (args.type === 'array') return new ArraySetting(args);
        else if (args.type === 'custom') return new CustomSetting(args);
        else throw {message: `Setting type ${args.type} unknown`};
    }

}
