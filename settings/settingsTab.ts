import {
	PluginSettingTab,
	Setting,
    App
} from "obsidian";

import Blockreffer from "main";
import { DEFAULT_SETTINGS } from "./settings";

const formatRegex = /!\{link\}/
const ERROR_COLOR = "var(--background-modifier-error)"

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
					// Check if the field contains a !{link}
					if (formatRegex.test(value)) {
						text.inputEl.style.borderColor = ""
					}
					else {
						text.inputEl.style.borderColor = ERROR_COLOR
					}

					// Check if empty and reset to default if it is
					if (value === "") this.plugin.settings.format = DEFAULT_SETTINGS.format;
					else			  this.plugin.settings.format = value;

					await this.plugin.saveSettings();
				})
				.then((text) => {
					// Check for invalid format on open
					if (!formatRegex.test(text.getValue())) {
						text.inputEl.style.borderColor = ERROR_COLOR
					}
				})
			);

		new Setting(containerEl)
			.setName("Use selected text as link display text")
            .setDesc("Use selected text as the link alias (the bit that goes after the | symbol).")
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
                .setDesc("Do not display the ^block-id in search results. It will still be displayed beneath the block content.")
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.removeIdFromContent)
                    .onChange(async (value) => {
                        this.plugin.settings.removeIdFromContent = value;
                        await this.plugin.saveSettings();
                    })
                );
		
		new Setting(containerEl)
			.setName("Use selected text as initial search")
            .setDesc("If true, selected text will be used when you open the search box.")
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
            .setDesc("Show just the file's name or the/full/path.md in search results?")
            .addDropdown(dropdown => dropdown
                .addOption("base", "File name")
                .addOption("path", "File path")
                .setValue(this.plugin.settings.fileName)
                .onChange(async (value: "base" | "path") => {
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
            .setDesc("Search text inside blocks.")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.content)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.content = value
                    await this.plugin.saveSettings();
                })
            );

		new Setting(containerEl)
			.setName("File path")
            .setDesc("Search file path and name.")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.path)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.path = value
                    await this.plugin.saveSettings();
                })
            );

		new Setting(containerEl)
			.setName("Block id")
            .setDesc("Search ^block-ids.")
			.addToggle(toggle => toggle
                .setValue(this.plugin.settings.toSearch.id)
                .onChange(async (value) => {
                    this.plugin.settings.toSearch.id = value
                    await this.plugin.saveSettings();
                })
            );
	}
}