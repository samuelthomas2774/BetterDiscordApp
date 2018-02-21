module.exports.default = {
    template: "<div style=\"margin-bottom: 15px; background-color: rgba(0, 0, 0, 0.2); border: 1px dashed rgba(255, 255, 255, 0.2); padding: 10px; color: #f6f6f7; font-weight: 500; font-size: 15px;\">Test custom setting {{ setting.id }}. This is from component.js in the plugin/theme's directory. (It can use functions.)</div>",
    props: ['setting', 'change']
};
