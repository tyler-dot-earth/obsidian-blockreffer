import { App, FuzzyMatch, FuzzySuggestModal, MarkdownView, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

export default class Blockreffer extends Plugin {
	async onload() {
		this.addCommand({
			id: 'open-block-search',
			name: 'Search blocks with references',
			callback: async () => {
				// Fetch your blocks here
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
		this.addSettingTab(new BlockrefferSettingsTab({ app: this.app, plugin: this }));
	}

	onunload() {

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
	plugin: Blockreffer;
	blocks: BlockSuggestion[];
	action: BlockRefAction;

	constructor({
		app,
		plugin,
		blocks,
		action,
		}: {
			app: App;
			plugin: Blockreffer;
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

	// fuzzy-searchable content
	getItemText(item: BlockSuggestion): string {
		// TODO make this configurable maybe?
		return item.content + item.file.path + item.id;
	}

	renderSuggestion({ item }: FuzzyMatch<BlockSuggestion>, el: HTMLElement ) {
		// TODO make this optional
		const contentWithoutId = item.content
			.replace(`^${item.id}`, "")
			.trim(); // cases like https://github.com/tyler-dot-earth/obsidian-blockreffer/issues/5

		// TODO make this optional
		function unlinkfy(text: string): DocumentFragment {
			const fragment = document.createDocumentFragment();
			let lastIndex = 0;
			const regex = /\[([^\]]+)\]\([^)]+\)/g;
			let match;

			while ((match = regex.exec(text)) !== null) {
				if (match.index > lastIndex) {
					fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
				}
				const span = document.createElement('span');
				span.className = 'suggestion-block-link';
				span.textContent = match[1];
				fragment.appendChild(span);
				lastIndex = regex.lastIndex;
			}

			if (lastIndex < text.length) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
			}

			return fragment;
		}
		const sansLink = unlinkfy(contentWithoutId);

		el.createDiv({ cls: "suggestion-content" }, (contentDiv) => {
			contentDiv.createDiv({
				// text: sansLink,
				cls: "suggestion-block-text",
			}).appendChild(sansLink);

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

class BlockrefferSettingsTab extends PluginSettingTab {
	plugin: Blockreffer;

	constructor({ app, plugin }: { app: App; plugin: Blockreffer }) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Bugs and feature requests")
			.setDesc("Encounter an issue or have an idea? Please open an issue on GitHub")
			.addButton((button) => {
				button.setButtonText("Open GitHub").onClick(() => {
					window.open(`https://github.com/tyler-dot-earth/obsidian-blockreffer/issues`);
				});
		});
	}
}
