import {
	App,
	FuzzyMatch,
	FuzzySuggestModal,
	MarkdownView,
	Plugin,
	TFile,
} from "obsidian";

import { BlockrefferSettings, DEFAULT_SETTINGS } from "settings/settings"
import { BlockrefferSettingTab } from "settings/settingsTab"

export default class Blockreffer extends Plugin {
	settings: BlockrefferSettings;

	async onload() {
		this.loadSettings();
		this.addCommand({
			id: "open-block-search",
			name: "Search blocks with references",
			callback: async () => {
				// Fetch your blocks here
				const blocks: BlockSuggestion[] = await this.getBlocksWithIds(
					this.app,
				);

				// new BlockSearchModal(this.app, blocks).open();
				new BlockSearchModal({
					app: this.app,
					plugin: this,
					blocks,
					action: "open",
				}).open();
			},
		});

		this.addCommand({
			id: "embed-block-search",
			name: "Embed block from existing reference",
			callback: async () => {
				// Fetch your blocks here
				const blocks: BlockSuggestion[] = await this.getBlocksWithIds(
					this.app,
				);

				// new BlockSearchModal(this.app, blocks).open();
				new BlockSearchModal({
					app: this.app,
					plugin: this,
					blocks,
					action: "embed",
				}).open();
			},
		});

		this.addSettingTab(new BlockrefferSettingTab(this.app, this));
	}

	onunload() {}

	async getBlocksWithIds(app: App): Promise<BlockSuggestion[]> {
		const files = app.vault.getMarkdownFiles();

		const blockRefs = [];
		for (const file of files) {
			const cache = app.metadataCache.getFileCache(file);
			if (cache && cache.blocks) {
				for (const [id, block] of Object.entries(cache.blocks)) {
					blockRefs.push({
						file: file.path,
						id,
						position: block.position,
					});
				}
			}
		}

		const blockSuggestions: BlockSuggestion[] = [];

		for (const file of app.vault.getMarkdownFiles()) {
			const cache = app.metadataCache.getFileCache(file);
			if (cache && cache.blocks) {
				const fileContent = await app.vault.cachedRead(file);

				for (const [id] of Object.entries(cache.blocks)) {
					const blockContent = fileContent.slice(
						cache.blocks[id].position.start.offset,
						cache.blocks[id].position.end.offset,
					);
					blockSuggestions.push({
						file: file,
						id: id,
						content: blockContent.trim(),
					});
				}
			}
		}

		return blockSuggestions;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

	renderSuggestion({ item }: FuzzyMatch<BlockSuggestion>, el: HTMLElement) {
		// TODO make this optional
		const contentWithoutId = item.content.replace(`^${item.id}`, "").trim(); // cases like https://github.com/tyler-dot-earth/obsidian-blockreffer/issues/5

		// TODO make this optional
		function unlinkfy(text: string): DocumentFragment {
			const fragment = document.createDocumentFragment();
			let lastIndex = 0;
			const regex = /\[([^\]]+)\]\([^)]+\)/g;
			let match;

			while ((match = regex.exec(text)) !== null) {
				if (match.index > lastIndex) {
					fragment.appendChild(
						document.createTextNode(
							text.slice(lastIndex, match.index),
						),
					);
				}
				const span = document.createElement("span");
				span.className = "blockreffer-suggestion-block-link";
				span.textContent = match[1];
				fragment.appendChild(span);
				lastIndex = regex.lastIndex;
			}

			if (lastIndex < text.length) {
				fragment.appendChild(
					document.createTextNode(text.slice(lastIndex)),
				);
			}

			return fragment;
		}
		const sansLink = unlinkfy(contentWithoutId);

		el.createDiv({ cls: "suggestion-content" }, (contentDiv) => {
			contentDiv
				.createDiv({
					// text: sansLink,
					cls: "blockreffer-suggestion-block-text",
				})
				.appendChild(sansLink);

			// TODO setting for path vs basename
			const from = item.file.basename;
			contentDiv.createEl("small", {
				text: `${from}#^${item.id}`,
				cls: "blockreffer-suggestion-block-file",
			});
		});
	}

	onChooseItem(item: BlockSuggestion, evt: MouseEvent | KeyboardEvent) {
		if (this.action === "embed") {
			const editor =
				this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			if (editor) {
				// Embed the block using the ref
				editor.replaceSelection(
					`![[${item.file.basename}#^${item.id}]]`,
				);
			}
		}

		if (this.action === "open") {
			// Navigate to the chosen block
			this.app.workspace.openLinkText(item.file.path, "", true);
			// TODO: scroll to the specific block
		}
	}
}
