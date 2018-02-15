(() => {
    if (window.__bd && window.__bd.ignited) return;

    console.log('[BetterDiscord|Sparkplug]');

    const ls = window.localStorage;
    if (!ls) console.warn('[BetterDiscord|Sparkplug] Failed to hook localStorage :(');
    const wsOrig = window.WebSocket;

    window.__bd = {
        localStorage: ls,
        wsHook: null,
        wsOrig,
        ignited: true
    }

    class WSHook extends window.WebSocket {

        constructor(url, protocols) {
            super(url, protocols);
            this.hook(url, protocols);
        }

        hook(url, protocols) {
            console.info(`[BetterDiscord|WebSocket Proxy] new WebSocket detected, url: ${url}`);
            if (!url.includes('gateway.discord.gg')) return;

            if (window.__bd.setWS) {
                window.__bd.setWS(this);
                console.info(`[BetterDiscord|WebSocket Proxy] WebSocket sent to instance`);
                return;
            }

            console.info(`[BetterDiscord|WebSocket Proxy] WebSocket stored to __bd['wsHook']`);
            window.__bd.wsHook = this;
        }

    }

    window.WebSocket = WSHook;
})();
