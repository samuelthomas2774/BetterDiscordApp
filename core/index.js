class BetterDiscord {

    constructor() {}

    async asyncTest() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("asyncTest!");
            }, 3000);
        });
    }

    async asyncTest2() {
        const at = await this.asyncTest();
        console.log(at);
        console.log("Finished!");
    }

}

module.exports = {
    BetterDiscord
};
