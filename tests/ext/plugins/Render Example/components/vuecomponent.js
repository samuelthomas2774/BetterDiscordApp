module.exports = (Vuewrap, props) => {
    return Vuewrap({
        render: function (createElement) {
            return createElement('button', {
                class: 'exampleCustomElement',
                on: {
                    click: this.onClick
                }
            }, 'v');
        },
        props: ['onClick']
    }, props);
};
