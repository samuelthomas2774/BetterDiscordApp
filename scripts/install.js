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

// Copy the keytar bindings to node_modules/keytar/vendor
const keytar_path = path.resolve(require.resolve('keytar'), '..', '..');
const prebuilt_keytar_bindings_path = path.resolve(__dirname, '..', 'other', 'keytar', 'keytar.node');
const keytar_release_path = path.join(keytar_path, 'build', 'Release');
const keytar_binding_path = path.join(keytar_release_path, 'keytar.node');

if (fs.existsSync(path.join(keytar_release_path, 'keytar.node'))) {
    const stat = fs.statSync(path.join(keytar_release_path, 'keytar.node'));

    // if (stat.isFile()) {
        console.log('Deleting keytar binding');
        fs.removeSync(path.join(keytar_path, 'build'));
    // }
}

if (!fs.existsSync(path.join(keytar_release_path, 'keytar.node'))) {
    fs.mkdirpSync(keytar_release_path);

    console.log('Copying keytar bindings from', prebuilt_keytar_bindings_path, 'to', keytar_binding_path);

    fs.copySync(prebuilt_keytar_bindings_path, keytar_binding_path);
}
