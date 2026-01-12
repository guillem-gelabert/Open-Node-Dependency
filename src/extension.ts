import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { parseTree, findNodeAtLocation } from "jsonc-parser";

export function activate(context: vscode.ExtensionContext) {
  const provider = new PackageJsonDefinitionProvider();

  const disposable = vscode.languages.registerDefinitionProvider(
    { language: "json", pattern: "**/package.json" },
    provider
  );
  context.subscriptions.push(disposable);
}

class PackageJsonDefinitionProvider implements vscode.DefinitionProvider {
  private static readonly DEP_SECTIONS = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ];

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Location | null {
    if (!document.fileName.endsWith("package.json")) {
      return null;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
      return null;
    }

    const text = document.getText();
    const tree = parseTree(text);
    if (!tree) {
      return null;
    }

    // Distance in characters from prosition 0:0
    const offset = document.offsetAt(position);

    // Traverse the AST
    for (const section of PackageJsonDefinitionProvider.DEP_SECTIONS) {
      const sectionNode = findNodeAtLocation(tree, [section]);
      if (!sectionNode || sectionNode.type !== "object" || !sectionNode.children) {
        continue;
      }

      // The children of DEP_SECTIONS should all be dependencies
      for (const entry of sectionNode.children) {
        // keyNode is the dependency name
        const keyNode = entry.children?.[0];
        // const versionNode = entry.children?.[1];
        if (!keyNode || keyNode.type !== "string") {
          continue;
        }

        /*
        * "lodash": "^4.17.21"
        * ^      ^
        * |      |
        * |      keyNode.offset + keyNode.length (end, exclusive)
        * keyNode.offset (start, inclusive)
        */
        if (offset >= keyNode.offset && offset < keyNode.offset + keyNode.length) {
          const depName = keyNode.value as string;
          const packageJsonPath = path.join(
            workspaceFolder.uri.fsPath,
            "node_modules",
            depName,
            "package.json"
          );

          if (fs.existsSync(packageJsonPath)) {
            return new vscode.Location(vscode.Uri.file(packageJsonPath), new vscode.Position(0, 0));
          }
        }
      }
    }

    return null;
  }
}
