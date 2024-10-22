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
                .setName("Remove block id from block content")
                .setDesc("Should the ^block-id text be removed from the block contents in search results (it will still be displayed beneath the block contents).")
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.removeIdFromContent)
                    .onChange(async (value) => {
                        this.plugin.settings.removeIdFromContent = value;
                        await this.plugin.saveSettings();
                    })
                )
		
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
		
        /* === What to search */
		new Setting(containerEl)
			.setName("What to search")
			.setHeading()

		new Setting(containerEl)
			.setName("Block content")
            .setDesc("Search for text inside blocks.")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.content)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.content = value
                    await this.plugin.saveSettings();
                })
            )

		new Setting(containerEl)
			.setName("File path")
            .setDesc("Search for file names")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.path)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.path = value
                    await this.plugin.saveSettings();
                })
            )

		new Setting(containerEl)
			.setName("Block id")
            .setDesc("Search for ^block-ids")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.id)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.id = value
                    await this.plugin.saveSettings();
                })
            )
	}
}