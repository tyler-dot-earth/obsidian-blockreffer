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
	}
}