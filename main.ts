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


		this.limit = this.plugin.settings.searchLimit;

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

	onOpen() {
		super.onOpen()

		if (this.plugin.settings.selectedTextAsSearch == false) return

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor
		if (editor) {
			this.inputEl.value = editor.getSelection()
			
			// We need to trigger the input event to make the results update
			this.inputEl.dispatchEvent(new Event("input"))
		}
	}

	getItems(): BlockSuggestion[] {
		return this.blocks;
	}

	// fuzzy-searchable content
	getItemText(item: BlockSuggestion): string {
		let toSearch = ""

		if (this.plugin.settings.toSearch.content) toSearch += item.content
		if (this.plugin.settings.toSearch.path   ) toSearch += item.file.path
		if (this.plugin.settings.toSearch.id     ) toSearch += item.id

		return toSearch;
	}

	renderSuggestion({ item }: FuzzyMatch<BlockSuggestion>, el: HTMLElement) {
		const contentWithoutId = this.plugin.settings.removeIdFromContent
			? item.content.replace(`^${item.id}`, "").trim() // cases like https://github.com/tyler-dot-earth/obsidian-blockreffer/issues/5
			: item.content.trim();

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

		const sansLink = unlinkfy(contentWithoutId)
		const withLink = document.createDocumentFragment()
				.appendChild(document.createTextNode(contentWithoutId))

		const suggestionBlockText = this.plugin.settings.parseLinks ? sansLink : withLink

		el.createDiv({ cls: "suggestion-content" }, (contentDiv) => {
			contentDiv
				.createDiv({
					cls: "blockreffer-suggestion-block-text",
				})
				.appendChild(suggestionBlockText);

			const from = this.plugin.settings.fileName == "base"
				? item.file.basename
				: item.file.path

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
				const selection = editor.getSelection()
				// Build the block
				const link = this.plugin.settings.keepText && selection
					? `[[${item.file.basename}#^${item.id}|${selection}]]`
					: `[[${item.file.basename}#^${item.id}]]`

				const replacement = this.plugin.settings.format.replace("{link}", link)

				// Embed the block using the ref
				editor.replaceSelection(replacement);
			}
		}

		if (this.action === "open") {
			// Navigate to the chosen block
			this.app.workspace.openLinkText(item.file.path, "", true);
			// TODO: scroll to the specific block
		}
	}
}
