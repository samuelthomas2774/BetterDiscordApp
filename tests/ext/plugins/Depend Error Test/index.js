module.exports = (Plugin, Api, Vendor) => {

    return class extends Plugin {
        onStart() {
            return true;
        }

        onStop() {
            return true;
        }
    }
}
