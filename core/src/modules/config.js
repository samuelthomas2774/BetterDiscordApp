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
        return this.paths[id];
        // const path = this.paths.find(path => path.id === id);
        // return full ? path : path.path;
    }

    addPath(id, path) {
        this.paths[id] = path;
    }

    get config() {
        return {
            version: this.version,
            paths: this.paths
        };
    }

}
