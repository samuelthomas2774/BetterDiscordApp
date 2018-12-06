const dummyTags = ['dark', 'light', 'simple', 'minimal', 'extra', 'something', 'tag', 'whatever', 'another', 'transparent'];

export default class ServerEmu {

    static async themes(args) {
        if (!this._themes) this._themes = this.generateThemes();

        await new Promise(r => setTimeout(r, Math.random() * 3000));

        let docs = [];

        if (args && args.sterm) {
            const { sterm } = args;
            const reg = new RegExp(sterm, 'gi');
            docs = this._themes.filter(doc => doc.tags.includes(sterm) || reg.exec(doc.name) || reg.exec(doc.description));
        } else {
            docs = this._themes;
        }

        if (args.sort) {
            switch (args.sort) {
            case 'updated':
                if (args.ascending) docs = docs.sort((docA, docB) => new Date(docA.updated).getTime() - new Date(docB.updated).getTime());
                else docs = docs.sort((docA, docB) => new Date(docB.updated).getTime() - new Date(docA.updated).getTime());
                break;
            case 'installs':
                if (args.ascending) docs = docs.sort((docA, docB) => docA.installs - docB.installs);
                else docs = docs.sort((docA, docB) => docB.installs - docA.installs);
                break;
            case 'users':
                if (args.ascending) docs = docs.sort((docA, docB) => docA.activeUsers - docB.activeUsers);
                else docs = docs.sort((docA, docB) => docB.activeUsers - docA.activeUsers);
                break;
            case 'rating':
                if (args.ascending) docs = docs.sort((docA, docB) => docA.rating - docB.rating);
                else docs = docs.sort((docA, docB) => docB.rating - docA.rating);
                break;
            }
        }

        const total = docs.length;
        const pages = Math.ceil(total / 9);

        let page = 1;
        if (args && args.page) {
            page = args.page;
            docs = docs.slice((page - 1) * 9, page * 9);
        } else {
            docs = docs.slice(0, 9);
        }

        return {
            docs,
            filters: {
                sterm: args.sterm || '',
                ascending: args.ascending || false,
                sort: args.sort || 'name'
            },
            pagination: {
                total,
                pages,
                limit: 9,
                page
            }
        }
    }

    static async plugins(args) {
        if (!this._plugins) this._plugins = this.generatePlugins();

        await new Promise(r => setTimeout(r, Math.random() * 3000));

        let docs = [];

        if (args && args.sterm) {
            const { sterm } = args;
            const reg = new RegExp(sterm, 'gi');
            docs = this._plugins.filter(doc => doc.tags.includes(sterm) || reg.exec(doc.name) || reg.exec(doc.description));
        } else {
            docs = this._plugins;
        }

        if (args.sort) {
            switch (args.sort) {
            case 'updated':
                if (args.ascending) docs = docs.sort((docA, docB) => new Date(docA.updated).getTime() - new Date(docB.updated).getTime());
                else docs = docs.sort((docA, docB) => new Date(docB.updated).getTime() - new Date(docA.updated).getTime());
                break;
            case 'installs':
                if (args.ascending) docs = docs.sort((docA, docB) => docA.installs - docB.installs);
                else docs = docs.sort((docA, docB) => docB.installs - docA.installs);
                break;
            case 'users':
                if (args.ascending) docs = docs.sort((docA, docB) => docA.activeUsers - docB.activeUsers);
                else docs = docs.sort((docA, docB) => docB.activeUsers - docA.activeUsers);
                break;
            case 'rating':
                if (args.ascending) docs = docs.sort((docA, docB) => docA.rating - docB.rating);
                else docs = docs.sort((docA, docB) => docB.rating - docA.rating);
                break;
            }
        }

        const total = docs.length;
        const pages = Math.ceil(total / 9);

        let page = 1;
        if (args && args.page) {
            page = args.page;
            docs = docs.slice((page - 1) * 9, page * 9);
        } else {
            docs = docs.slice(0, 9);
        }

        return {
            docs,
            filters: {
                sterm: args.sterm || '',
                ascending: args.ascending || false,
                sort: args.sort || 'name'
            },
            pagination: {
                total,
                pages,
                limit: 9,
                page
            }
        }
    }

    static generateThemes() {
        const docs = [];
        const count = Math.floor(Math.random() * 50 + 30);

        for (let i = 0; i < count; i++) {
            const id = `theme${i}-${this.randomId()}`;
            const name = `Dummy Theme ${i}`;
            const tags = dummyTags.sort(() => .5 - Math.random()).slice(0, 3);

            docs.push({
                id,
                name,
                tags,
                installs: Math.floor(Math.random() * 5000) + 5000,
                updated: this.randomTimestamp(),
                rating: Math.floor(Math.random() * 500) + 500,
                activeUsers: Math.floor(Math.random() * 1000) + 1000,
                rated: Math.random() > .5,
                version: this.randomVersion(),
                repository: this.dummyThemeRepo,
                files: this.dummyFiles,
                author: this.dummyAuthor,
                description: ''
            });
        }

        return docs;
    }

    static generatePlugins() {
        const docs = [];
        const count = Math.floor(Math.random() * 50 + 30);

        for (let i = 0; i < count; i++) {
            const id = `plugin${i}-${this.randomId()}`;
            const name = `Dummy Plugin ${i}`;
            const tags = dummyTags.sort(() => .5 - Math.random()).slice(0, 3);

            docs.push({
                id,
                name,
                tags,
                installs: Math.floor(Math.random() * 5000) + 5000,
                updated: this.randomTimestamp(),
                rating: Math.floor(Math.random() * 500) + 500,
                activeUsers: Math.floor(Math.random() * 1000) + 1000,
                rated: Math.random() > .5,
                version: this.randomVersion(),
                repository: this.dummyPluginRepo,
                files: this.dummyFiles,
                author: this.dummyAuthor,
                description: ''
            });
        }

        return docs;
    }

    static get dummyThemeRepo() {
        return {
            name: 'ExampleRepository',
            baseUri: 'https://github.com/Jiiks/ExampleRepository',
            rawUri: 'https://github.com/Jiiks/ExampleRepository/raw/master',
            assetUri: 'https://api.github.com/repos/Jiiks/ExampleRepository/releases/assets/10023264'
        }
    }

    static get dummyPluginRepo() {
        return {
            name: 'ExampleRepository',
            baseUri: 'https://github.com/Jiiks/ExampleRepository',
            rawUri: 'https://github.com/Jiiks/ExampleRepository/raw/master',
            assetUri: 'https://api.github.com/repos/Jiiks/ExampleRepository/releases/assets/10023265'
        }
    }

    static get dummyFiles() {
        return {
            readme: 'Example/readme.md',
            previews: [{
                large: 'Example/preview1-big.png',
                thumb: 'Example/preview1-small.png'
            }]
        }
    }

    static get dummyAuthor() {
        return 'Someone';
    }

    static randomId() {
        return btoa(Math.random()).substring(3, 9);
    }

    static randomTimestamp() {
        return `2018-${Math.floor((Math.random() * 12) + 1).toString().padStart(2, '0')}-${Math.floor((Math.random() * 30) + 1).toString().padStart(2, '0')}T14:51:32.057Z`;
    }

    static randomVersion() {
        return `${Math.round(Math.random() * 3)}.${Math.round(Math.random() * 10)}.${Math.round(Math.random() * 10)}`;
    }
}
