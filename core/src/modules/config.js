/**
 * BetterDiscord Config Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Module from './modulebase';

export default class Config extends Module {

    get version() {
        return this.args.version;
    }

    get clientVersion() {
        return this.args.clientVersion;
    }

    setClientVersion(clientVersion) {
        this.args.clientVersion = clientVersion;
    }

    get paths() {
        return this.args.paths;
    }

    getPath(id, full) {
        const path = this.paths.find(p => p.id === id);
        return full ? path : path.path;
    }

    addPath(id, path) {
        this.paths.push({ id, path });
    }

    get config() {
        return {
            version: this.version,
            paths: this.paths
        };
    }

    // Compatibility with old client code and new installer args
    compatibility() {
        this.args.paths = Object.entries(this.args.paths).map(([id, path]) => ({ id, path }));
    }
}
