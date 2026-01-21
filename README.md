# Open Node Dependency

A VS Code/Cursor extension that enables Cmd+click (or Ctrl+click) navigation on dependency names in `package.json` files to open the corresponding `package.json` in `node_modules`. Useful when debugging version mismatches or writing patches for third-party modules.

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

### From Marketplace (Recommended)

Install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ggs.open-node-dependency):

1. Open VS Code
2. Press `Ctrl+P` (or `Cmd+P` on Mac) to open Quick Open
3. Paste: `ext install ggs.open-node-dependency`
4. Press Enter

Or search for "Open Node Dependency" in the Extensions view (`Ctrl+Shift+X`).

### From Source

For development or contributing:

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to launch the Extension Development Host

## Requirements

- VS Code 1.105.0 or higher
- Node.js project with `node_modules` directory

## How It Works

The extension registers a `DefinitionProvider` for `package.json` files. When you Cmd+hover over a dependency name, it:

1. Parses the JSON using `jsonc-parser` to build an AST with source positions
2. Checks if the cursor is within a dependency key
3. Returns a location pointing to `node_modules/{package}/package.json`
4. Only provides navigation for packages that actually exist in `node_modules`

## Known Limitations

### Partial Underline on Hyphenated Packages

When hovering over packages with hyphens (e.g., `jsonc-parser`) or scoped packages (e.g., `@types/node`), VS Code only underlines the word segment under the cursor, not the full package name.

This is a VS Code limitation: the editor uses word boundaries for the hover highlight, and characters like `-`, `/`, and `@` are treated as word separators. **The navigation still works correctly** — clicking anywhere within the package name will open the correct file.

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
