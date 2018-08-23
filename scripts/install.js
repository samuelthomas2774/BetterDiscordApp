const process = require('process');
const fs = require('fs-extra');
const path = require('path');

// Copy the node-sass bindings to node_modules/node-sass/vendor
const node_sass_path = path.resolve(require.resolve('node-sass'), '..', '..');
const prebuilt_node_sass_bindings_path = path.resolve(__dirname, '..', 'other', 'node_sass_bindings');

for (const node_sass_binding_name of fs.readdirSync(prebuilt_node_sass_bindings_path)) {
    const binding_path = path.join(prebuilt_node_sass_bindings_path, node_sass_binding_name);
    const installation_path = path.join(node_sass_path, 'vendor', node_sass_binding_name);

    if (fs.existsSync(installation_path)) continue;

    console.log('Copying node-sass binding from', binding_path, 'to', installation_path);

    fs.copySync(binding_path, installation_path);
}
