# Open Node Dependency

A VS Code/Cursor extension that enables cmd+click (or ctrl+click) navigation on dependency names in `package.json` files to open the corresponding `package.json` in `node_modules`. Useful when debugging version missmatches or writting patches for third party modules.

## Features

- **Quick Navigation**: Cmd+click (Mac) or Ctrl+click (Windows/Linux) on any dependency name in `package.json` to open its `package.json` file
- **Multiple Dependency Types**: Works with `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`
- **Scoped Packages**: Fully supports scoped packages (e.g., `@scope/package`)
- **Automatic Detection**: Only creates links for packages that exist in `node_modules`

## Usage

1. Open any `package.json` file in your workspace
2. Hold Cmd (Mac) or Ctrl (Windows/Linux) and click on any dependency name
3. The extension will open `node_modules/{package}/package.json` in a new editor

## Installation

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 in VS Code to open a new Extension Development Host window
5. Open a `package.json` file and test the cmd+click functionality

### Package for Distribution

1. Install `vsce`: `npm install -g @vscode/vsce`
2. Run `vsce package` to create a `.vsix` file
3. Install the `.vsix` file via `code --install-extension open-node-dependency-0.0.1.vsix`

## Requirements

- VS Code 1.74.0 or higher
- Node.js project with `node_modules` directory

## How It Works

The extension registers a `DocumentLinkProvider` for `package.json` files. When you open a `package.json`, it:

1. Parses the JSON to extract dependency names
2. Finds the text positions of each dependency name
3. Creates clickable links pointing to `node_modules/{package}/package.json`
4. Only creates links for packages that actually exist in `node_modules`

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch
```

## License

See [LICENSE](LICENSE) file for details.
