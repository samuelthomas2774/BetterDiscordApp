module.exports = (Plugin, { Logger, Settings }) => class extends Plugin {
	async onstart() {
		// Some array event examples
		const arraySetting = this.settings.getSetting('default', 'array-1');
		Logger.log('Array setting', arraySetting);
		arraySetting.on('item-added', event => Logger.log('Item', event.item, 'was added to the array setting'));
		arraySetting.on('item-updated', event => Logger.log('Item', event.item, 'of the array setting was updated', event));
		arraySetting.on('item-removed', event => Logger.log('Item', event.item, 'removed from the array setting'));

        // Create a new settings set and show it in a modal
        const set = Settings.createSet({});
        const category = await set.addCategory({ id: 'default' });

        const setting = await category.addSetting({
            id: 'test',
            type: 'text',
            text: 'Enter some text',
            multiline: true // Works better now
        });

        setting.on('setting-updated', event => Logger.log('Setting was changed to', event.value));

        const scheme = await set.addScheme({
            id: 'scheme-1',
            name: 'Test scheme',
            icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cow_female_black_white.jpg/220px-Cow_female_black_white.jpg',
            settings: [{ category: 'default', settings: [{ id: 'test', value: 'Some\npresent\n\nmultiline\n\ntext' }] }]
        });

        set.on('settings-updated', async updatedSettings => {
            Logger.log('Updated settings', updatedSettings);
            await new Promise(resolve => setTimeout(resolve, 500));
            set.setSaved();
        })

        set.showModal('Custom settings panel');
	}
};
