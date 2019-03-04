module.exports = function(api) {

    api.cache(true);

    const presets = [['@babel/env', {
        targets: {
            'node': '8.6.0',
            'chrome': '60'
        }
    }], '@babel/react'];

    const plugins = [];

    return {
        presets,
        plugins
    }
}