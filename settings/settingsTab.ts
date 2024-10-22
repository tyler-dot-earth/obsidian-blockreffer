import {
	PluginSettingTab,
	Setting,
    App
} from "obsidian"

import Blockreffer from "main"

export class BlockrefferSettingTab extends PluginSettingTab {
	plugin: Blockreffer;

	constructor(app: App, plugin: Blockreffer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
        /* === Search settings === */
		new Setting(containerEl)
			.setHeading()
			.setName("Search settings")
		
		new Setting(containerEl)
			.setName("Search limit")
            .setDesc("The number of search results to display.")
			.addSlider(slider => slider
                .setLimits(1,50,1)
                .setValue(this.plugin.settings.searchLimit)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.searchLimit = value
                    await this.plugin.saveSettings();
                })
            )
	}
}