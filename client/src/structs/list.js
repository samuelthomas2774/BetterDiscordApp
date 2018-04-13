
export default class List extends Array {

    constructor() {
        super(...arguments);
    }

    get(...filters) {
        return this.find(item => {
            for (let filter of filters) {
                for (let key in filter) {
                    if (filter.hasOwnProperty(key)) {
                        if (item[key] !== filter[key]) return false;
                    }
                }
            }
            return true;
        });
    }

    from(array, map) {
        for (const value of array) {
            returnUsers.push(map ? map(value) : value);
        }
    }

}
