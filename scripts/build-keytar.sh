#!/bin/sh

PLATFORM="$1"
ARCH="$2"
NODE_API_VERSION="$3"
ELECTRON_VERSION="$4"
ELECTRON_URL="https://atom.io/download/electron"

DIRECTORY="release-tmp/keytar.node/keytar-4.3.0"
FILENAME="$PLATFORM-$ARCH-$NODE_API_VERSION.node"

if [ `node -p 'process.platform'` != "$PLATFORM" ]; then
    echo "You must be running on $PLATFORM to build keytar for it."
    exit 1
fi

cd node_modules/keytar

mv build/Release release-tmp

if [ -f release-tmp/keytar.node ]; then
    rm release-tmp/keytar.node
fi

if [ -f $DIRECTORY/$FILENAME ]; then
    echo "A binding already exists at $DIRECTORY/$FILENAME - deleting it"
    rm $DIRECTORY/$FILENAME
fi

# Build the keytar binding
# This will be placed at build/Release/keytar.node
echo "Building keytar for $PLATFORM-$ARCH with Node.js API version $NODE_API_VERSION for Electron $ELECTRON_VERSION"
../.bin/node-gyp rebuild --target=$ELECTRON_VERSION --arch $ARCH --dist-url=$ELECTRON_URL

# Move it to the right place
echo "Moving keytar.node to $DIRECTORY"
mkdir -p $DIRECTORY
mv build/Release/keytar.node $DIRECTORY/$FILENAME
rm -rf build/Release

mv release-tmp build/Release
