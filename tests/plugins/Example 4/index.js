module.exports = (Plugin, { Logger, Settings, Modals, BdMenu: { BdMenuItems }, Api }) => class extends Plugin {
	async onstart() {
        this.keybindEvent = this.keybindEvent.bind(this);

		// Some array event examples
		const arraySetting = this.settings.getSetting('default', 'array-1');
		Logger.log('Array setting', arraySetting);
		arraySetting.on('item-added', event => Logger.log('Item', event.item, 'was added to the array setting'));
		arraySetting.on('item-updated', event => Logger.log('Item', event.item, 'of the array setting was updated', event));
		arraySetting.on('item-removed', event => Logger.log('Item', event.item, 'removed from the array setting'));

        // Keybind setting examples
        const keybindSetting = this.settings.getSetting('default', 'keybind-1');
        Logger.log('Keybind setting', keybindSetting);
        keybindSetting.on('keybind-activated', this.keybindEvent);

        // Create a new settings set and add it to the menu
        const set = Settings.createSet({
            text: this.name
        });
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

        const setting2 = await category.addSetting({
            id: 'setting-2',
            type: 'text',
            text: 'Enter some text',
            fullwidth: true
        });

        setting2.on('setting-updated', event => Logger.log('Setting 2 was changed to', event.value));

        this.menuItem = BdMenuItems.addSettingsSet('Plugins', set, 'Plugin 4');

        this.menuItem2 = BdMenuItems.addVueComponent('Plugins', 'Also Plugin 4', {
            template: `<component :is="SettingsWrapper" :headertext="plugin.name + ' custom menu panel'">
                <p style="margin-top: 0; color: #f6f6f7;">Test</p>
            </component>`,
            props: ['SettingsWrapper'],
            data() { return {
                Api, plugin: Api.plugin
            }; }
        });
	}

	onstop() {
        const keybindSetting = this.settings.getSetting('default', 'keybind-1');
        keybindSetting.off('keybind-activated', this.keybindEvent);

        BdMenuItems.removeAll();
	}

    keybindEvent(event) {
        Logger.log('Keybind pressed', event);
        Modals.basic('Example Plugin 4', 'Test keybind activated.');
    }
};
