/**
 * BetterDiscord Database Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

const Datastore = require('nedb');

class Database  {

    constructor(dbPath) {
        this.exec = this.exec.bind(this);
        this.update = this.update.bind(this);
        this.db = new Datastore({ filename: dbPath, autoload: true });
    }

    async update(cmd) {
        return new Promise((resolve, reject) => {
            this.db.update(cmd.args, cmd.data, { upsert: true }, (err, docs) => {
                if (err) return reject(err);
                this.db.persistence.compactDatafile();
                resolve(docs);
            });
        });
    }

    async find(cmd) {
        console.log('FIND', cmd);
        return new Promise((resolve, reject) => {
            this.db.find(cmd.args, (err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    }

    async exec(cmd) {
        switch (cmd.action) {
            case 'update':
                return this.update(cmd);
            case 'find':
                return this.find(cmd);
        }
        throw 'Invalid Command';
    }

}

module.exports = { Database };
