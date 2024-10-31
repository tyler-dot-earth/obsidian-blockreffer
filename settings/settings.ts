export interface BlockrefferSettings {
    /** The format string for inserting a backlink.
     * @example `!{link}` becomes `![[link]]
     */
    format: string;

    /** Whether the selected text should be retained as the link display text. */
    keepText: boolean;

    /** Whether links should be parsed using the `unlinkfy` method. */
    parseLinks: boolean;

    /** Uses the selected text as the initial search value. */
    selectedTextAsSearch: boolean;

    /** Specifies content that should be searched. */
    toSearch: {
        /** Whether to search within file content. */
        content: boolean;

        /** Whether to search for matches in the file path. */
        path: boolean;

        /** Whether to search for matches by file ID. */
        id: boolean;
    };

    /** Maximum number of search results to display. */
    searchLimit: number;

    /** Whether to remove `^block-id` from the content. */
    removeIdFromContent: boolean;

    /** How the file name should be displayed: "path" for full path or "base" for name only. */
    fileName: "path" | "base";
}

export const DEFAULT_SETTINGS: BlockrefferSettings = {
	format: '!{link}',
	keepText: false,
	parseLinks: true,
	selectedTextAsSearch: false,
    toSearch: {
        content: true, 
        path: true, 
        id: true
    },
    searchLimit: 10,
    removeIdFromContent: true,
    fileName: "base" as const,
}