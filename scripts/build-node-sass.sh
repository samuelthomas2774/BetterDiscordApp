#!/bin/sh

PLATFORM="$1"
ARCH="$2"
NODE_API_VERSION="$3"
ELECTRON_VERSION="$4"
ELECTRON_URL="https://atom.io/download/electron"

DIRECTORY="vendor/$PLATFORM-$ARCH-$NODE_API_VERSION"

if [ `node -p 'process.platform'` != "$PLATFORM" ]; then
    echo "You must be running on $PLATFORM to build node-sass for it."
    exit 1
fi

cd node_modules/node-sass

if [ -f $DIRECTORY/binding.node ]; then
    echo "A binding already exists at $DIRECTORY/binding.node - deleting it"
    rm $DIRECTORY/binding.node
fi

# Build the node-sass binding
# This will be placed at build/Release/binding.node
echo "Building node-sass for $PLATFORM-$ARCH with Node.js API version $NODE_API_VERSION for Electron $ELECTRON_VERSION"
../.bin/node-gyp rebuild --target=$ELECTRON_VERSION --arch $ARCH --dist-url=$ELECTRON_URL

# Move it to the right place
echo "Moving binding.node to $DIRECTORY"
mkdir -p $DIRECTORY
cp build/Release/binding.node $DIRECTORY/binding.node
rm -rf build
