import { App, Editor, FuzzyMatch, FuzzySuggestModal, MarkdownRenderer, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// TODO Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'open-block-search',
			name: 'Search blocks with references',
			callback: async () => {
				// Fetch your blocks here
				// const blocks: BlockSuggestion[] = await this.fetchBlocks();
				const blocks: BlockSuggestion[] = await this.getBlocksWithIds(this.app);

				// new BlockSearchModal(this.app, blocks).open();
				new BlockSearchModal({
					app: this.app,
					plugin: this,
					blocks,
					action: "open",
				}).open();
			}
		});

		this.addCommand({
			id: 'embed-block-search',
			name: 'Embed block from existing reference',
			callback: async () => {
				// Fetch your blocks here
				// const blocks: BlockSuggestion[] = await this.fetchBlocks();
				const blocks: BlockSuggestion[] = await this.getBlocksWithIds(this.app);

				// new BlockSearchModal(this.app, blocks).open();
				new BlockSearchModal({
					app: this.app,
					plugin: this,
					blocks,
					action: "embed",
				}).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SampleSettingTab(this.app, this));
		this.addSettingTab(new SampleSettingTab({ app: this.app, plugin: this }));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async getBlocksWithIds(app: App): Promise<BlockSuggestion[]> {
		const files = app.vault.getMarkdownFiles();

		const blockRefs = [];
		for (const file of files) {
			const cache = app.metadataCache.getFileCache(file);
			if (cache && cache.blocks) {
				for (const [id, block] of Object.entries(cache.blocks)) {
				blockRefs.push({ file: file.path, id, position: block.position });
				}
			}
		}

		const blockSuggestions: BlockSuggestion[] = [];

		for (const file of app.vault.getMarkdownFiles()) {
			const cache = app.metadataCache.getFileCache(file);
			if (cache && cache.blocks) {
				const fileContent = await app.vault.cachedRead(file);
				const lines = fileContent.split('\n');

				for (const [id, block] of Object.entries(cache.blocks)) {
					const blockContent = lines.slice(block.position.start.line, block.position.end.line + 1).join('\n');
					blockSuggestions.push({
						file: file,
						id: id,
						content: blockContent.trim()
					});
				}
			}
		}

		return blockSuggestions;
	}
}

interface BlockSuggestion {
	file: TFile;
	id: string;
	content: string;
}

type BlockRefAction = "embed" | "open";

class BlockSearchModal extends FuzzySuggestModal<BlockSuggestion> {
	plugin: MyPlugin;
	blocks: BlockSuggestion[];
	action: BlockRefAction;

	constructor({
		app,
		plugin,
		blocks,
		action,
		}: {
			app: App;
			plugin: MyPlugin;
			blocks: BlockSuggestion[];
			action: BlockRefAction;
	}) {
		super(app);
		this.plugin = plugin;
		this.blocks = blocks;
		this.action = action;
		this.setPlaceholder("Search for ^referenced blocks...");
		this.limit = 10; // TODO make configurable

		// TODO
		// this.setInstructions([
		// 	{
		// 		command: "enter",
		// 		purpose: "to jump",
		// 	},
		// 	{
		// 		command: "shift+enter",
		// 		purpose: "to embed",
		// 	},
		// ]);
	}

	getItems(): BlockSuggestion[] {
		return this.blocks;
	}

	getItemText(item: BlockSuggestion): string {
		// TODO make this configurable maybe?
		return item.content + item.file.path;
	}

	renderSuggestion({ item }: FuzzyMatch<BlockSuggestion>, el: HTMLElement ) {
		// TODO make this optional
		const contentWithoutId = item.content.replace(`^${item.id}`, "");

		// TODO make this optional
		function unlinkfy(text: string): string {
			return text.replace(
				/\[([^\]]+)\]\([^)]+\)/g,
				`<span class="suggestion-block-link">$1</span>`
			);
		}
		const sansLink = unlinkfy(contentWithoutId);

		el.createDiv({ cls: "suggestion-content" }, (contentDiv) => {
			const textDiv = contentDiv.createDiv({
				// text: sansLink,
				cls: "suggestion-block-text",
			});
			textDiv.innerHTML = sansLink;

			// TODO setting for path vs basename
			const from = item.file.basename;
			contentDiv.createEl('small', {
				text: `${from}#^${item.id}`,
				cls: "suggestion-block-file",
			});

			// TODO maybe use markdownRenderer? doesn't quite look right though..
			// but alternative is that i handle markdown like `**bold**` i guess? 🤔
			// OTOH markdown is just readable text too... so maybe not a big deal?
			//
			// here's an example anyway:
			//
			// const markdownDiv = contentDiv.createDiv({
			// 	cls: "suggestion-markdown-test",
			// });
			// const sourcePath = this.app.workspace.getActiveFile()?.path;
			// if (!sourcePath) throw new Error("No source path"); // TODO feels wrong
			// MarkdownRenderer.render(this.app, contentWithoutId, markdownDiv, sourcePath, this.plugin)
		});
	}

	onChooseItem(item: BlockSuggestion, evt: MouseEvent | KeyboardEvent) {
		if (this.action === "embed") {
			console.log('embed', { item });

			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			if (editor) {
				// Embed the block using the ref
				editor.replaceSelection(`![[${item.file.basename}#^${item.id}]]`);
			}
		}

		if (this.action === "open") {
			// Navigate to the chosen block
			this.app.workspace.openLinkText(item.file.path, "", true);
			// TODO: scroll to the specific block
		}
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor({ app, plugin }: { app: App; plugin: MyPlugin }) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h1', { text: 'Blockreffer' });

		new Setting(containerEl)
			.setName("Bugs and feature requests")
			.setDesc("Encounter an issue or have an idea? Please open an issue on GitHub")
			.addButton((button) => {
				button.setButtonText("Open GitHub").onClick(() => {
					window.open(`https://github.com/tyler-dot-earth/obsidian-blockreffer/issues`);
				});
		});

		// containerEl.createEl(
		//   'small',
		//   {
		//     text: 'Created by ',
		//   }
		// ).createEl(
		//     'a',
		//     {
		//       text: 'tyler.earth',
		//       href: 'https://tyler.earth/',
		//     }
		//   );

		// new Setting(containerEl)
		//   .setName('Setting #1')
		//   .setDesc('It\'s a secret')
		//   .addText(text => text
		//     .setPlaceholder('Enter your secret')
		//     .setValue(this.plugin.settings.mySetting)
		//     .onChange(async (value) => {
		//       this.plugin.settings.mySetting = value;
		//       await this.plugin.saveSettings();
		// }));
	}
}
