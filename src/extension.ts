import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

let enabled = true;

export function activate(context: vscode.ExtensionContext) {
  const linkProvider = new PackageJsonLinkProvider();

  // Toggle command
  const toggleCommand = vscode.commands.registerCommand(
    "open-node-dependency.toggle",
    () => {
      enabled = !enabled;
      linkProvider.setEnabled(enabled);
      vscode.window.showInformationMessage(
        `Package.json navigation: ${enabled ? "enabled" : "disabled"}`
      );
    }
  );
  context.subscriptions.push(toggleCommand);

  // Document link provider for package.json dependencies
  const linkProviderDisposable = vscode.languages.registerDocumentLinkProvider(
    { language: "json", pattern: "**/package.json" },
    linkProvider
  );
  context.subscriptions.push(linkProviderDisposable);
}

class PackageJsonLinkProvider implements vscode.DocumentLinkProvider {
  private enabled = true;

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  provideDocumentLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
    if (!this.enabled || !document.fileName.endsWith("package.json")) {
      return [];
    }

    const text = document.getText();
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

    if (!workspaceFolder) {
      return [];
    }

    try {
      const packageJson = JSON.parse(text);
      const depSections = [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
      ];

      const links: vscode.DocumentLink[] = [];

      for (const section of depSections) {
        if (packageJson[section] && typeof packageJson[section] === "object") {
          for (const depName of Object.keys(packageJson[section])) {
            const link = this.createLinkForDependency(
              document,
              text,
              depName,
              section,
              workspaceFolder.uri.fsPath
            );
            if (link) {
              links.push(link);
            }
          }
        }
      }

      return links;
    } catch {
      // Invalid JSON, ignore
      return [];
    }
  }

  private createLinkForDependency(
    document: vscode.TextDocument,
    text: string,
    depName: string,
    section: string,
    workspacePath: string
  ): vscode.DocumentLink | null {
    // Check if package exists in node_modules
    const packageJsonPath = path.join(workspacePath, "node_modules", depName, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    // Find section start
    const sectionRegex = new RegExp(`"${this.escapeRegex(section)}"\\s*:\\s*\\{`);
    const sectionMatch = sectionRegex.exec(text);
    if (!sectionMatch) return null;

    // Find dependency within section
    const depRegex = new RegExp(`"${this.escapeRegex(depName)}"\\s*:`);
    const searchText = text.slice(sectionMatch.index);
    const depMatch = depRegex.exec(searchText);
    if (!depMatch) return null;

    const absoluteIndex = sectionMatch.index + depMatch.index;
    const startPos = document.positionAt(absoluteIndex + 1); // skip opening quote
    const endPos = document.positionAt(absoluteIndex + 1 + depName.length);
    const range = new vscode.Range(startPos, endPos);

    const targetUri = vscode.Uri.file(packageJsonPath);
    return new vscode.DocumentLink(range, targetUri);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
