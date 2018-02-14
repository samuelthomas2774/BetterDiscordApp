/**
 * BetterDiscord Error Struct
 * Copyright (c) 2015-present Jiiks/JsSucks - https://github.com/Jiiks / https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

export class Error {

    constructor(args) {
        this.args = args;
        this.showStack = false; // For error modal
    }

    get module() {
        return this.args.module;
    }

    get message() {
        return this.args.message;
    }

    get err() {
        return this.args.err;
    }

    get stackTrace() {
        return this.err.stack;
    }

    get _type() {
        return 'err';
    }

}
