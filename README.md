# Blockreffer for Obsidian

Search and embed blocks with `^block-references` aka `^block-refs` aka `^block-ids`.

![image](https://github.com/user-attachments/assets/040fbea0-4364-4f3a-9229-e1602571e928)

![image](https://github.com/user-attachments/assets/b467137d-ca02-4aff-a7ea-bed1154a40fb)


## Features

- Embed blocks with `^block-refs`
- Search your vault for blocks with `^block-refs`

## Installation

Like all other plugins, you can install this in Obsidian - `Settings > Plugins > Community plugins > Browse > search for Blockreffer`

You can also click the install button on Obsidian plugin's search page: https://obsidian.md/plugins?search=blockreffer

Alternatively, use [BRAT](https://tfthacker.com/BRAT) to install beta versions of this plugin:
1. Install BRAT
	- Search for "BRAT" in Obsidian's community plugins
	- This may also work for you: [obsidian://show-plugin?id=obsidian42-brat](obsidian://show-plugin?id=obsidian42-brat)
1. Enable BRAT after installation
1. Open BRAT settings
1. Click "Add Beta plugin"
1. Paste this into the repository field: `https://github.com/tyler-dot-earth/obsidian-blockreffer`
1. Click "Add plugin"
1. :sparkles: The plugin should now be installed.
	- NOTE: this will automatically update and use the latest beta version of the plugin.

## FAQ

### What are block references?

Check out the Obsidian docs: https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+block+in+a+note

### Can I assign hotkeys to this plugin's commands?

Yes. Use the `Hotkeys` (core Obsidian plugin) to assign hotkeys to this plugin's commands.

---

# Contributing

## Contributors

- [tyler.earth](https://github.com/tyler-dot-earth) - plugin author
- [GuardKenzie](https://github.com/GuardKenzie) - settings

## First time developing plugins?

Quick starting guide for new plugin devs:

- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint .\src\`

---

# Funding

If you found this project helpful, please consider kicking a couple bucks my way:

- [GitHub Sponsor](https://github.com/sponsors/tyler-dot-earth)
- [Ko-Fi](https://ko-fi.com/tylerdotearth)
- [Buy Me a Coffee](https://buymeacoffee.com/tyler.earth)
