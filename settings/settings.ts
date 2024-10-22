export interface BlockrefferSettings {
	format: string;                 // Format string for link insert.
	keepText: boolean;              // Keep selected text as link display text
	parseLinks: boolean;            // Should we parse links with unlinkfy?
	selectedTextAsSearch: boolean;  // Use selected text as inital search value
    toSearch: {
        content: boolean, 
        path: boolean, 
        id: boolean
    };                              // What should we search for inside files
    searchLimit: number;            // The limit of search results to display
    removeIdFromContent: boolean;   // Should we remove the ^block-id
    fileName: string;               // Should we display the file as it's path or it's name. 
                                    //   Can be "path" or "base"
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
    fileName: "base"
}