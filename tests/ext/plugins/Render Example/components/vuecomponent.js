module.exports = (VueWrap, props) => {
    return VueWrap('somecomponent', {
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
}
