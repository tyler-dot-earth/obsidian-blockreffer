import {
	PluginSettingTab,
	Setting,
    App
} from "obsidian";

import Blockreffer from "main";

export class BlockrefferSettingTab extends PluginSettingTab {
	plugin: Blockreffer;

	constructor(app: App, plugin: Blockreffer) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setHeading()
			.setName("How do you want your link?");

		new Setting(containerEl)
			.setName('Link format')
			.setDesc('How your link will be inserted into the document. Use {link} as a placeholder for the actual link.')
			.addText(text => text
				.setPlaceholder('!{link}')
				.setValue(this.plugin.settings.format)
				.onChange(async (value) => {
					this.plugin.settings.format = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Use selected text as link display text")
            .setDesc("If true, will use the text you have selected as the display text for the link (the bit that goes after the | symbol).")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.keepText)
				.onChange(async (value) => {
					this.plugin.settings.keepText = value;
					await this.plugin.saveSettings();
				})
			);
		
        /* === Search settings === */
		new Setting(containerEl)
			.setHeading()
			.setName("Search settings");

		new Setting(containerEl)
			.setName("Parse links")
            .setDesc("Should markdown links be displayed as just their display text in search results?")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.parseLinks)
				.onChange(async (value) => {
					this.plugin.settings.parseLinks = value;
					await this.plugin.saveSettings();
				})
			);
        
            new Setting(containerEl)
                .setName("Remove block id from block content")
                .setDesc("Should the ^block-id text be removed from the block contents in search results (it will still be displayed beneath the block contents).")
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.removeIdFromContent)
                    .onChange(async (value) => {
                        this.plugin.settings.removeIdFromContent = value;
                        await this.plugin.saveSettings();
                    })
                );
		
		new Setting(containerEl)
			.setName("Use selected text as initial search")
            .setDesc("If true, when you open the search box, the text you have selected will already be searched for.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.selectedTextAsSearch)
				.onChange(async (value) => {
					this.plugin.settings.selectedTextAsSearch = value;
					await this.plugin.saveSettings();
				})
			);
		
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
            );
        
        new Setting(containerEl)
            .setName("File name in result")
            .setDesc("Do you want the names of the files in the search results to displayed as their/full/path.md or just as their name?")
            .addDropdown(dropdown => dropdown
                .addOption("base", "File name")
                .addOption("path", "File path")
                .setValue(this.plugin.settings.fileName)
                .onChange(async (value) => {
                    this.plugin.settings.fileName = value
                    await this.plugin.saveSettings()
                })
            );
		
        /* === What to search === */
		new Setting(containerEl)
			.setName("What to search")
			.setHeading();

		new Setting(containerEl)
			.setName("Block content")
            .setDesc("Search for text inside blocks.")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.content)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.content = value
                    await this.plugin.saveSettings();
                })
            );

		new Setting(containerEl)
			.setName("File path")
            .setDesc("Search for file names")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.path)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.path = value
                    await this.plugin.saveSettings();
                })
            );

		new Setting(containerEl)
			.setName("Block id")
            .setDesc("Search for ^block-ids")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.id)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.id = value
                    await this.plugin.saveSettings();
                })
            );
	}
}