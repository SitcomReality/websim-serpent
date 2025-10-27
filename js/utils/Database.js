export const room = new (window.WebsimSocket || (window.websim && window.websim.WebsimSocket) || class {
    // Fallback no-op stub for environments where window.websim is not available.
    constructor() {
        console.warn('WebsimSocket not available on window.websim; using stub.');
    }
    collection() {
        return {
            getList: () => [],
            subscribe: () => () => {},
            create: async () => { throw new Error('Websim not available'); },
            delete: async () => { throw new Error('Websim not available'); },
            update: async () => { throw new Error('Websim not available'); },
            filter: () => ({ getList: () => [], subscribe: () => () => {} })
        };
    }
})();

