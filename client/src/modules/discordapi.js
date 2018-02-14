import WebpackModules from './webpackmodules';
import { $ } from 'vendor';

class Private {
    static get token() {
        return WebpackModules.getModuleByName('UserInfoStore').getToken();
    }
}

class EndPoints {
    static get base() { return '/api/v6' }
    static get channels() { return `${this.base}/channels` }

    static channel(channelId) {
        return `${this.channels}/${channelId}`;
    }

    static messages(channelId) {
        return `${this.channels}/${channelId}/messages`;
    }
}

class Ajax {

    static get authHeader() {
        return { authorization: Private.token };
    }

    static async POST(endpoint, data, contentType = 'application/json') {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: endpoint,
                contentType,
                headers: this.authHeader,
                data: JSON.stringify(data),
                success: e => resolve(e),
                fail: e => reject(e)
            });
        });
    }

    static async GET(endpoint, contentType = 'application/json') {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: endpoint,
                contentType,
                headers: this.authHeader,
                success: e => resolve(e),
                fail: e => reject(e)
            });
        });
    }
}

class Map {

    constructor(data) {
        this.data = data;
    }

    find(filters) {
        return this.data.find(item => {
            for (let filter of filters) {
                const key = Object.keys(filter)[0];
                const value = filter[key];
                if (item[key] !== value) return false;
            }
            return true;
        });
    }

}

class Guild {
    constructor(data) {
        data.sendMessage = this.sendMessage;
        return data;
    }
}


class Channel {

    constructor(data) {
        data.sendMessage = this.sendMessage;
        return data;
    }

    async sendMessage(content) {
        try {
            const result = await Ajax.POST(EndPoints.messages(this.id), { content });
            return result;
        } catch (err) {
            throw err;
        }
    }

}

export default class DiscordApi {

    static get channels() {
        const channels = WebpackModules.getModuleByName('ChannelStore').getChannels();
        const returnChannels = [];
        for (const [key, value] of Object.entries(channels)) {
            returnChannels.push(new Channel(value));
        }
        return new Map(returnChannels);
    }

    static get guilds() {
        const guilds = WebpackModules.getModuleByName('GuildStore').getGuilds();
        const returnGuilds = [];
        for (const [key, value] of Object.entries(guilds)) {
            returnGuilds.push(new Guild(value));
        }
        return new Map(returnGuilds);
    }
    
}
