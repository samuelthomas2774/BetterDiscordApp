module.exports = (React, props) => {
    return React.createElement(
        'button',
        { className: 'exampleCustomElement', onClick: props.onClick },
        'r'
    );
}
