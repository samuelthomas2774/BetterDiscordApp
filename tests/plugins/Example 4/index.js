module.exports = (Plugin, { Logger }) => class extends Plugin {
	onstart() {
		// Some array event examples
		const arraySetting = this.settings.getSetting('default', 'array-1');
		Logger.log('Array setting', arraySetting);
		arraySetting.on('item-added', event => Logger.log('Item', event.item, 'was added to the array setting'));
		arraySetting.on('item-updated', event => Logger.log('Item', event.item, 'of the array setting was updated', event));
		arraySetting.on('item-removed', event => Logger.log('Item', event.item, 'removed from the array setting'));
	}
};
